package com.sprintly.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private UUID userId;
    private UUID organizationId;
    private String email;
    private Set<String> roles;
    private String accessToken;
}
