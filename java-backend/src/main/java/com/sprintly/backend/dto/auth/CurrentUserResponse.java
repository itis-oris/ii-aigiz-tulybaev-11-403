package com.sprintly.backend.dto.auth;

import com.sprintly.backend.dto.organization.OrganizationResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
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
    private String organizationName;
    private List<OrganizationResponse> organizations;
    private Set<String> roles;
}
