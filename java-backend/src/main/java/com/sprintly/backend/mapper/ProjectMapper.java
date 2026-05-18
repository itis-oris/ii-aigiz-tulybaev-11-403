package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.project.ProjectResponse;
import com.sprintly.backend.entity.Project;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class ProjectMapper {

    private static final List<String> DEFAULT_BOARD_TABS = List.of("Main");

    public ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .description(project.getDescription())
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
            .boardTabs(
                project.getBoards().stream()
                    .filter(board -> board.getDeletedAt() == null)
                    .sorted(
                        Comparator.comparing(
                            board -> board.getPosition() != null ? board.getPosition() : Long.MAX_VALUE
                        )
                    )
                    .map(board -> board.getName())
                    .toList().isEmpty()
                    ? DEFAULT_BOARD_TABS
                    : project.getBoards().stream()
                        .filter(board -> board.getDeletedAt() == null)
                        .sorted(
                            Comparator.comparing(
                                board -> board.getPosition() != null ? board.getPosition() : Long.MAX_VALUE
                            )
                        )
                        .map(board -> board.getName())
                        .toList()
            )
            .createdAt(project.getCreatedAt())
            .deletedAt(project.getDeletedAt())
            .build();
    }
}
