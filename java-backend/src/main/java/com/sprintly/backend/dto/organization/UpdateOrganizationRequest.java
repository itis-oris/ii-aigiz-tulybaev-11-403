package com.sprintly.backend.dto.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrganizationRequest {

    @NotBlank
    @Size(min = 2, max = 255)
    private String name;
}
