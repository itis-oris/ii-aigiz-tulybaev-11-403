package com.sprintly.backend.dto.task;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AssignTaskRequest {

    private UUID assigneeId;
}
