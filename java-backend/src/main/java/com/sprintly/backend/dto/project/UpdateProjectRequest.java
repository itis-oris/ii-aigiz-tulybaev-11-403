package com.sprintly.backend.dto.project;

import com.sprintly.backend.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UpdateProjectRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    private ProjectStatus status;

    private UUID ownerId;
}
