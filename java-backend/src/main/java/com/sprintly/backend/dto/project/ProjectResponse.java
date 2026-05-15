package com.sprintly.backend.dto.project;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class ProjectResponse {

    private UUID id;
    private String name;
    private UUID organizationId;
    private String organizationName;
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;
}
