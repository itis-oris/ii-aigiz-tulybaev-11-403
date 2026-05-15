package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.board.BoardResponse;
import com.sprintly.backend.entity.Board;
import org.springframework.stereotype.Component;

@Component
public class BoardMapper {

    public BoardResponse toResponse(Board board) {
        return BoardResponse.builder()
            .id(board.getId())
            .name(board.getName())
            .position(board.getPosition())
            .projectId(board.getProject() != null ? board.getProject().getId() : null)
            .projectName(board.getProject() != null ? board.getProject().getName() : null)
            .createdAt(board.getCreatedAt())
            .deletedAt(board.getDeletedAt())
            .build();
    }
}
