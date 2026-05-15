package com.sprintly.backend.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateCommentRequest {

    @NotNull
    private UUID taskId;

    @NotBlank
    @Size(max = 5000)
    private String text;
}
