package com.sprintly.backend.dto.projectfolder;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class ProjectFolderResponse {

    private UUID id;
    private String name;
    private UUID organizationId;
    private String organizationName;
    private UUID ownerId;
    private String ownerEmail;
    private String ownerFirstname;
    private String ownerLastname;
    private String ownerMiddlename;
    private String ownerAvatarUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;
}
