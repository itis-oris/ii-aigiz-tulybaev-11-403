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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final String PROJECTS_BY_ORGANIZATION_CACHE = "projectsByOrganization";

    private final ProjectRepository projectRepository;
    private final ProjectFolderRepository projectFolderRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final S3StorageService s3StorageService;

    @Transactional(readOnly = true)
    @Cacheable(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public List<ProjectResponse> findAll(CustomUserDetails currentUser) {
        return projectRepository.findAllByOrganization_IdAndDeletedAtIsNull(currentUser.getOrganizationId()).stream()
            .map(projectMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(UUID projectId, CustomUserDetails currentUser) {
        return projectMapper.toResponse(getProjectInOrganization(projectId, currentUser.getOrganizationId()));
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public ProjectResponse create(CreateProjectRequest request, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

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
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING)
                .organization(organization)
                .owner(owner)
                .folder(folder)
                .createdAt(OffsetDateTime.now())
                .build()
        );

        return projectMapper.toResponse(project);
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public ProjectResponse update(UUID projectId, UpdateProjectRequest request, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        if (request.getName() != null) {
            project.setName(request.getName().trim());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getOwnerId() != null) {
            project.setOwner(
                resolveProjectOwner(
                    request.getOwnerId(),
                    currentUser.getId(),
                    currentUser.getOrganizationId()
                )
            );
        }
        project.setFolder(
            resolveProjectFolder(request.getFolderId(), currentUser.getOrganizationId())
        );

        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public void delete(UUID projectId, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());

        if (project.getDeletedAt() != null) {
            throw new IllegalStateException("Project already deleted");
        }

        project.setDeletedAt(OffsetDateTime.now());
        projectRepository.save(project);
    }

    @Transactional
    @CacheEvict(value = PROJECTS_BY_ORGANIZATION_CACHE, key = "#currentUser.organizationId")
    public ProjectResponse uploadImage(UUID projectId, MultipartFile file, CustomUserDetails currentUser) {
        ensureManagerAccess(currentUser);

        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        String imageUrl = s3StorageService.uploadImage(file, "projects/" + project.getId() + "/image");
        project.setImageUrl(imageUrl);

        return projectMapper.toResponse(projectRepository.save(project));
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getOrganization() == null || !organizationId.equals(project.getOrganization().getId())) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private User resolveProjectOwner(UUID requestedOwnerId, UUID fallbackOwnerId, UUID organizationId) {
        UUID ownerId = requestedOwnerId != null ? requestedOwnerId : fallbackOwnerId;
        User owner = userRepository.findWithRolesById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Project owner not found"));

        boolean belongsToOrganization = owner.getOrganizations().stream()
            .anyMatch(organization -> organizationId.equals(organization.getId()));

        if (!belongsToOrganization) {
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

        if (folder.getOrganization() == null || !organizationId.equals(folder.getOrganization().getId())) {
            throw new AccessDeniedException("Project folder does not belong to current organization");
        }

        return folder;
    }

    private void ensureManagerAccess(CustomUserDetails currentUser) {
        boolean hasAccess = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (!hasAccess) {
            throw new AccessDeniedException("Insufficient permissions for project modification");
        }
    }
}
