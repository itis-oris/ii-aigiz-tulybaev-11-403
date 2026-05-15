package com.sprintly.backend.dto.column;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class ColumnResponse {

    private UUID id;
    private String name;
    private Long position;
    private UUID boardId;
    private String boardName;
    private OffsetDateTime deletedAt;
}
