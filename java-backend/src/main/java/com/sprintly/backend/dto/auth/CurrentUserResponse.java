package com.sprintly.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class CurrentUserResponse {

    private UUID userId;
    private UUID organizationId;
    private String email;
    private String firstname;
    private String lastname;
    private String middlename;
    private String avatarUrl;
    private Set<String> roles;
}
