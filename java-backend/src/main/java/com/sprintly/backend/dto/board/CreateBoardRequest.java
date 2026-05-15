package com.sprintly.backend.dto.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateBoardRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    private UUID projectId;

    private Long position;
}
