package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.project.ProjectResponse;
import com.sprintly.backend.entity.Board;
import com.sprintly.backend.entity.Project;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class ProjectMapper {

    private static final List<String> DEFAULT_BOARD_TABS = List.of("Main");

    public ProjectResponse toResponse(Project project) {
        return toResponse(project, null);
    }

    public ProjectResponse toResponse(Project project, String currentUserProjectRole) {
        List<String> boardTabs = getBoardTabs(project);

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
            .currentUserProjectRole(currentUserProjectRole)
            .folderId(project.getFolder() != null ? project.getFolder().getId() : null)
            .boardTabs(boardTabs)
            .createdAt(project.getCreatedAt())
            .deletedAt(project.getDeletedAt())
            .build();
    }

    private List<String> getBoardTabs(Project project) {
        List<Board> boards = new ArrayList<>();
        for (Board board : project.getBoards()) {
            if (board.getDeletedAt() == null) {
                boards.add(board);
            }
        }

        boards.sort(Comparator.comparing(this::getBoardPosition));

        List<String> boardTabs = new ArrayList<>();
        for (Board board : boards) {
            boardTabs.add(board.getName());
        }

        return boardTabs.isEmpty() ? DEFAULT_BOARD_TABS : boardTabs;
    }

    private Long getBoardPosition(Board board) {
        return board.getPosition() != null ? board.getPosition() : Long.MAX_VALUE;
    }
}
