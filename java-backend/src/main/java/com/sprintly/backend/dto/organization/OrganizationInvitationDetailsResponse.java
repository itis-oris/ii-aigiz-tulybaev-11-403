package com.sprintly.backend.dto.organization;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class OrganizationInvitationDetailsResponse {

    private UUID organizationId;
    private String organizationName;
    private String email;
    private OffsetDateTime expiresAt;
    private boolean expired;
    private boolean accepted;
    private boolean revoked;
}
