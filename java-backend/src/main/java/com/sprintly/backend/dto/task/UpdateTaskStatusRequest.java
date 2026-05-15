package com.sprintly.backend.dto.task;

import com.sprintly.backend.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTaskStatusRequest {

    @NotNull
    private TaskStatus status;
}
