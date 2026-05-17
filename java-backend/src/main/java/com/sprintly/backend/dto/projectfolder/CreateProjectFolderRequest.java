package com.sprintly.backend.dto.projectfolder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateProjectFolderRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    private UUID ownerId;
}
