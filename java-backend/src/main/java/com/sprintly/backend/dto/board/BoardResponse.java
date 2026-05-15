package com.sprintly.backend.dto.board;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class BoardResponse {

    private UUID id;
    private String name;
    private Long position;
    private UUID projectId;
    private String projectName;
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;
}
