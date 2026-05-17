package com.sprintly.backend.dto.organization;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SwitchOrganizationRequest {

    @NotNull
    private UUID organizationId;
}
