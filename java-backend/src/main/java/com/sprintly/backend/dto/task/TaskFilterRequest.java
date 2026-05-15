package com.sprintly.backend.dto.task;

import com.sprintly.backend.entity.enums.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class TaskFilterRequest {

    private UUID projectId;
    private UUID assigneeId;
    private TaskStatus status;
    private Integer priority;
    private String search;
}
