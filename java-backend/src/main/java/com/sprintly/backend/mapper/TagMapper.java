package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.tag.TagResponse;
import com.sprintly.backend.entity.Tag;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {

    public TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
            .id(tag.getId())
            .name(tag.getName())
            .color(tag.getColor())
            .system(false)
            .projectId(tag.getProject() != null ? tag.getProject().getId() : null)
            .projectName(tag.getProject() != null ? tag.getProject().getName() : null)
            .createdAt(tag.getCreatedAt())
            .updatedAt(tag.getUpdatedAt())
            .deletedAt(tag.getDeletedAt())
            .build();
    }
}
