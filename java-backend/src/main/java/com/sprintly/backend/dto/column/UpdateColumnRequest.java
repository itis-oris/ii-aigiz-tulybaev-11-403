package com.sprintly.backend.dto.column;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateColumnRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    private Long position;
}
