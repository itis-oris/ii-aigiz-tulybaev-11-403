package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.project.ProjectResponse;
import com.sprintly.backend.entity.Project;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .imageUrl(project.getImageUrl())
            .organizationId(project.getOrganization() != null ? project.getOrganization().getId() : null)
            .organizationName(project.getOrganization() != null ? project.getOrganization().getName() : null)
            .status(project.getStatus())
            .ownerId(project.getOwner() != null ? project.getOwner().getId() : null)
            .ownerEmail(project.getOwner() != null ? project.getOwner().getEmail() : null)
            .ownerFirstname(project.getOwner() != null ? project.getOwner().getFirstname() : null)
            .ownerLastname(project.getOwner() != null ? project.getOwner().getLastname() : null)
            .ownerMiddlename(project.getOwner() != null ? project.getOwner().getMiddlename() : null)
            .ownerAvatarUrl(project.getOwner() != null ? project.getOwner().getAvatarUrl() : null)
            .folderId(project.getFolder() != null ? project.getFolder().getId() : null)
            .createdAt(project.getCreatedAt())
            .deletedAt(project.getDeletedAt())
            .build();
    }
}
