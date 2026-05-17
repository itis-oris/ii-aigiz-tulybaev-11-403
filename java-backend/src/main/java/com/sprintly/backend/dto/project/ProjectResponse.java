package com.sprintly.backend.dto.project;

import com.sprintly.backend.entity.enums.ProjectStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class ProjectResponse {

    private UUID id;
    private String name;
    private String imageUrl;
    private UUID organizationId;
    private String organizationName;
    private ProjectStatus status;
    private UUID ownerId;
    private String ownerEmail;
    private String ownerFirstname;
    private String ownerLastname;
    private String ownerMiddlename;
    private String ownerAvatarUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;
}
