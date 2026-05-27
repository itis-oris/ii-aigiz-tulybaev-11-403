package com.sprintly.backend.dto.organization;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class OrganizationResponse {

    private UUID id;
    private String name;
    private UUID ownerId;
    private OffsetDateTime createdAt;
    private boolean active;
}
