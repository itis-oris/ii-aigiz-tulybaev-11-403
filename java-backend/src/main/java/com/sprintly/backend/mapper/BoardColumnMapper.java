package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.column.ColumnResponse;
import com.sprintly.backend.entity.BoardColumn;
import org.springframework.stereotype.Component;

@Component
public class BoardColumnMapper {

    public ColumnResponse toResponse(BoardColumn column) {
        return ColumnResponse.builder()
            .id(column.getId())
            .name(column.getName())
            .position(column.getPosition())
            .boardId(column.getBoard() != null ? column.getBoard().getId() : null)
            .boardName(column.getBoard() != null ? column.getBoard().getName() : null)
            .deletedAt(column.getDeletedAt())
            .build();
    }
}
