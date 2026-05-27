package com.sprintly.backend.service;

import com.sprintly.backend.dto.projectfolder.CreateProjectFolderRequest;
import com.sprintly.backend.dto.projectfolder.ProjectFolderResponse;
import com.sprintly.backend.dto.projectfolder.UpdateProjectFolderRequest;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.ProjectFolder;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.ProjectFolderMapper;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.ProjectFolderRepository;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectFolderService {

    private final ProjectFolderRepository projectFolderRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectFolderMapper projectFolderMapper;
    private final ProjectAccessService projectAccessService;
    private final CachedViewService cachedViewService;
    private final CacheInvalidationService cacheInvalidationService;

    @Transactional(readOnly = true)
    public List<ProjectFolderResponse> findAll(CustomUserDetails currentUser) {
        return cachedViewService.getProjectFolders(currentUser.getOrganizationId());
    }

    @Transactional
    public ProjectFolderResponse create(CreateProjectFolderRequest request, CustomUserDetails currentUser) {
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        projectAccessService.ensureOrgAdmin(currentUser, organization, "Insufficient permissions for project folder modification");

        User owner = resolveFolderOwner(
            request.getOwnerId(),
            currentUser.getId(),
            currentUser.getOrganizationId()
        );

        ProjectFolder folder = projectFolderRepository.save(
            ProjectFolder.builder()
                .name(request.getName().trim())
                .organization(organization)
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .build()
        );
        cacheInvalidationService.evictProjectFolders(currentUser.getOrganizationId());

        return projectFolderMapper.toResponse(folder);
    }

    @Transactional
    public ProjectFolderResponse update(
        UUID folderId,
        UpdateProjectFolderRequest request,
        CustomUserDetails currentUser
    ) {
        ProjectFolder folder = getFolderInOrganization(folderId, currentUser.getOrganizationId());
        projectAccessService.ensureOrgAdmin(currentUser, folder.getOrganization(), "Insufficient permissions for project folder modification");
        folder.setName(request.getName().trim());
        if (request.getOwnerId() != null) {
            folder.setOwner(
                resolveFolderOwner(
                    request.getOwnerId(),
                    currentUser.getId(),
                    currentUser.getOrganizationId()
                )
            );
        }

        ProjectFolder savedFolder = projectFolderRepository.save(folder);
        cacheInvalidationService.evictProjectFolders(currentUser.getOrganizationId());
        return projectFolderMapper.toResponse(savedFolder);
    }

    @Transactional
    public void delete(UUID folderId, CustomUserDetails currentUser) {
        ProjectFolder folder = getFolderInOrganization(folderId, currentUser.getOrganizationId());
        projectAccessService.ensureOrgAdmin(currentUser, folder.getOrganization(), "Insufficient permissions for project folder modification");

        for (Project project : projectRepository.findAllByFolder_IdAndDeletedAtIsNull(folder.getId())) {
            project.setFolder(null);
        }

        folder.setDeletedAt(OffsetDateTime.now());
        projectFolderRepository.save(folder);
        cacheInvalidationService.evictProjectFolders(currentUser.getOrganizationId());
    }

    private ProjectFolder getFolderInOrganization(UUID folderId, UUID organizationId) {
        ProjectFolder folder = projectFolderRepository.findByIdAndDeletedAtIsNull(folderId)
            .orElseThrow(() -> new ResourceNotFoundException("Project folder not found"));

        if (!belongsToOrganization(folder, organizationId)) {
            throw new AccessDeniedException("Project folder does not belong to current organization");
        }

        return folder;
    }

    private boolean belongsToOrganization(ProjectFolder folder, UUID organizationId) {
        return folder.getOrganization() != null
            && organizationId.equals(folder.getOrganization().getId());
    }

    private User resolveFolderOwner(UUID requestedOwnerId, UUID fallbackOwnerId, UUID organizationId) {
        UUID ownerId = requestedOwnerId != null ? requestedOwnerId : fallbackOwnerId;
        return userRepository.findByIdAndOrganizations_Id(ownerId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Project folder owner not found"));
    }

}
