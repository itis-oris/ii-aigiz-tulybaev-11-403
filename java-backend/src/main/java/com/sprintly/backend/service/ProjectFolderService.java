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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectFolderService {

    private final ProjectFolderRepository projectFolderRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectFolderMapper projectFolderMapper;

    @Transactional(readOnly = true)
    public List<ProjectFolderResponse> findAll(CustomUserDetails currentUser) {
        return projectFolderRepository
            .findAllByOrganization_IdAndDeletedAtIsNullOrderByCreatedAtAsc(currentUser.getOrganizationId())
            .stream()
            .map(projectFolderMapper::toResponse)
            .toList();
    }

    @Transactional
    public ProjectFolderResponse create(CreateProjectFolderRequest request, CustomUserDetails currentUser) {
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(currentUser.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

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

        return projectFolderMapper.toResponse(folder);
    }

    @Transactional
    public ProjectFolderResponse update(
        java.util.UUID folderId,
        UpdateProjectFolderRequest request,
        CustomUserDetails currentUser
    ) {
        ProjectFolder folder = getFolderInOrganization(folderId, currentUser.getOrganizationId());
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

        return projectFolderMapper.toResponse(projectFolderRepository.save(folder));
    }

    @Transactional
    public void delete(java.util.UUID folderId, CustomUserDetails currentUser) {
        ProjectFolder folder = getFolderInOrganization(folderId, currentUser.getOrganizationId());

        if (folder.getDeletedAt() != null) {
            throw new IllegalStateException("Project folder already deleted");
        }

        for (Project project : projectRepository.findAllByFolder_IdAndDeletedAtIsNull(folder.getId())) {
            project.setFolder(null);
        }

        folder.setDeletedAt(OffsetDateTime.now());
        projectFolderRepository.save(folder);
    }

    private ProjectFolder getFolderInOrganization(java.util.UUID folderId, java.util.UUID organizationId) {
        ProjectFolder folder = projectFolderRepository.findByIdAndDeletedAtIsNull(folderId)
            .orElseThrow(() -> new ResourceNotFoundException("Project folder not found"));

        if (folder.getOrganization() == null || !organizationId.equals(folder.getOrganization().getId())) {
            throw new AccessDeniedException("Project folder does not belong to current organization");
        }

        return folder;
    }

    private User resolveFolderOwner(java.util.UUID requestedOwnerId, java.util.UUID fallbackOwnerId, java.util.UUID organizationId) {
        java.util.UUID ownerId = requestedOwnerId != null ? requestedOwnerId : fallbackOwnerId;
        User owner = userRepository.findByIdAndOrganizations_Id(ownerId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Project folder owner not found"));

        return owner;
    }

    private void ensureManagerAccess(CustomUserDetails currentUser) {
        boolean hasAccess = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (!hasAccess) {
            throw new AccessDeniedException("Insufficient permissions for project folder modification");
        }
    }
}
