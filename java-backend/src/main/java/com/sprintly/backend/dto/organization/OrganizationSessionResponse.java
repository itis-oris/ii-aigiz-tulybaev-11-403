package com.sprintly.backend.dto.organization;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrganizationSessionResponse {

    private OrganizationResponse organization;
    private String accessToken;
}
