package com.sprintly.backend.service;

import com.sprintly.backend.dto.project.CreateProjectRequest;
import com.sprintly.backend.dto.project.ProjectResponse;
import com.sprintly.backend.dto.project.UpdateProjectRequest;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.ProjectFolder;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.ProjectStatus;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.ProjectMapper;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.ProjectFolderRepository;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectFolderRepository projectFolderRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final ProjectAccessService projectAccessService;
    private final ProjectMemberService projectMemberService;
    private final BoardService boardService;
    private final S3StorageService s3StorageService;

    @Transactional(readOnly = true)
    public List<ProjectResponse> findAll(CustomUserDetails currentUser) {
        List<ProjectResponse> responses = new ArrayList<>();
        for (Project project : projectRepository.findAllByOrganization_IdAndDeletedAtIsNull(currentUser.getOrganizationId())) {
            if (projectAccessService.isProjectMember(currentUser, project)) {
                responses.add(toResponse(project, currentUser));
            }
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, project, "Insufficient permissions for project access");
        return toResponse(project, currentUser);
    }

    @Transactional
    public ProjectResponse create(CreateProjectRequest request, CustomUserDetails currentUser) {
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        projectAccessService.ensureOrgAdmin(currentUser, organization, "Insufficient permissions for project creation");

        User owner = resolveProjectOwner(
            request.getOwnerId(),
            currentUser.getId(),
            currentUser.getOrganizationId()
        );
        ProjectFolder folder = resolveProjectFolder(
            request.getFolderId(),
            currentUser.getOrganizationId()
        );

        Project project = projectRepository.save(
            Project.builder()
                .name(request.getName().trim())
                .description(normalizeDescription(request.getDescription()))
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING)
                .organization(organization)
                .owner(owner)
                .folder(folder)
                .createdAt(OffsetDateTime.now())
                .build()
        );
        projectMemberService.ensureProjectMembership(project, owner);
        boardService.createDefaultBoard(project);

        return toResponse(project, currentUser);
    }

    @Transactional
    public ProjectResponse update(UUID projectId, UpdateProjectRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for project modification");

        updateProjectFields(project, request);
        updateProjectOwner(project, request, currentUser);
        project.setFolder(resolveProjectFolder(request.getFolderId(), currentUser.getOrganizationId()));

        return toResponse(projectRepository.save(project), currentUser);
    }

    private void updateProjectFields(Project project, UpdateProjectRequest request) {
        if (request.getName() != null) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            project.setDescription(normalizeDescription(request.getDescription()));
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
    }

    private void updateProjectOwner(Project project, UpdateProjectRequest request, CustomUserDetails currentUser) {
        if (request.getOwnerId() != null) {
            User owner = resolveProjectOwner(
                request.getOwnerId(),
                currentUser.getId(),
                currentUser.getOrganizationId()
            );
            project.setOwner(owner);
            projectMemberService.ensureProjectMembership(project, owner);
        }
    }

    @Transactional
    public void delete(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for project modification");

        project.setDeletedAt(OffsetDateTime.now());
        projectRepository.save(project);
    }

    @Transactional
    public ProjectResponse uploadImage(UUID projectId, MultipartFile file, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for project modification");
        String imageUrl = s3StorageService.uploadImage(file, "projects/" + project.getId() + "/image");
        project.setImageUrl(imageUrl);

        return toResponse(projectRepository.save(project), currentUser);
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!belongsToOrganization(project, organizationId)) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private User resolveProjectOwner(UUID requestedOwnerId, UUID fallbackOwnerId, UUID organizationId) {
        UUID ownerId = requestedOwnerId != null ? requestedOwnerId : fallbackOwnerId;
        User owner = userRepository.findWithOrganizationsById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Project owner not found"));

        if (!belongsToOrganization(owner, organizationId)) {
            throw new AccessDeniedException("Project owner must be a member of current organization");
        }

        return owner;
    }

    private ProjectFolder resolveProjectFolder(UUID folderId, UUID organizationId) {
        if (folderId == null) {
            return null;
        }

        ProjectFolder folder = projectFolderRepository.findByIdAndDeletedAtIsNull(folderId)
            .orElseThrow(() -> new ResourceNotFoundException("Project folder not found"));

        if (!belongsToOrganization(folder, organizationId)) {
            throw new AccessDeniedException("Project folder does not belong to current organization");
        }

        return folder;
    }

    private boolean belongsToOrganization(Project project, UUID organizationId) {
        return project.getOrganization() != null
            && organizationId.equals(project.getOrganization().getId());
    }

    private boolean belongsToOrganization(User user, UUID organizationId) {
        for (Organization organization : user.getOrganizations()) {
            if (organizationId.equals(organization.getId())) {
                return true;
            }
        }

        return false;
    }

    private boolean belongsToOrganization(ProjectFolder folder, UUID organizationId) {
        return folder.getOrganization() != null
            && organizationId.equals(folder.getOrganization().getId());
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String normalized = description.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private ProjectResponse toResponse(Project project, CustomUserDetails currentUser) {
        return projectMapper.toResponse(
            project,
            projectAccessService.isProjectOwner(currentUser, project)
                ? "OWNER"
                : "MEMBER"
        );
    }

}
