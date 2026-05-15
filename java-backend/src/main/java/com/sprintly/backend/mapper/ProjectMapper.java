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
            .organizationId(project.getOrganization() != null ? project.getOrganization().getId() : null)
            .organizationName(project.getOrganization() != null ? project.getOrganization().getName() : null)
            .createdAt(project.getCreatedAt())
            .deletedAt(project.getDeletedAt())
            .build();
    }
}
