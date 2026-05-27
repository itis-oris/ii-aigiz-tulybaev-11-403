package com.sprintly.backend.dto.column;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateColumnRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    private UUID boardId;

    private Long position;
}
