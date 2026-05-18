package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.projectfolder.ProjectFolderResponse;
import com.sprintly.backend.entity.ProjectFolder;
import org.springframework.stereotype.Component;

@Component
public class ProjectFolderMapper {

    public ProjectFolderResponse toResponse(ProjectFolder folder) {
        return ProjectFolderResponse.builder()
            .id(folder.getId())
            .name(folder.getName())
            .organizationId(folder.getOrganization() != null ? folder.getOrganization().getId() : null)
            .organizationName(folder.getOrganization() != null ? folder.getOrganization().getName() : null)
            .ownerId(folder.getOwner() != null ? folder.getOwner().getId() : null)
            .ownerEmail(folder.getOwner() != null ? folder.getOwner().getEmail() : null)
            .ownerFirstname(folder.getOwner() != null ? folder.getOwner().getFirstname() : null)
            .ownerLastname(folder.getOwner() != null ? folder.getOwner().getLastname() : null)
            .ownerMiddlename(folder.getOwner() != null ? folder.getOwner().getMiddlename() : null)
            .ownerAvatarUrl(folder.getOwner() != null ? folder.getOwner().getAvatarUrl() : null)
            .createdAt(folder.getCreatedAt())
            .deletedAt(folder.getDeletedAt())
            .build();
    }
}
