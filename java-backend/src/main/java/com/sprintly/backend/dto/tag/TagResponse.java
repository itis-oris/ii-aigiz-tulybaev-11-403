package com.sprintly.backend.dto.tag;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class TagResponse {

    private UUID id;
    private String name;
    private String color;
    private Boolean system;
    private UUID projectId;
    private String projectName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
