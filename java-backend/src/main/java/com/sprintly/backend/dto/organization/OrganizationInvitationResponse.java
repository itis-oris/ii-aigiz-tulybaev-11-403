package com.sprintly.backend.dto.organization;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class OrganizationInvitationResponse {

    private UUID id;
    private UUID organizationId;
    private String organizationName;
    private String email;
    private String token;
    private OffsetDateTime createdAt;
    private OffsetDateTime expiresAt;
    private OffsetDateTime acceptedAt;
    private OffsetDateTime revokedAt;
}
