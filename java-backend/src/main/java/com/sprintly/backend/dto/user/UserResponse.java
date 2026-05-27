package com.sprintly.backend.dto.user;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Builder
public class UserResponse {

    private UUID id;
    private String firstname;
    private String lastname;
    private String middlename;
    private String email;
    private String avatarUrl;
    private UUID organizationId;
    private String organizationName;
    private Set<String> roles;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
