package com.sprintly.backend.dto.task;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class MoveTaskRequest {

    @NotNull
    private UUID columnId;

    @Min(0)
    private Long position;
}
