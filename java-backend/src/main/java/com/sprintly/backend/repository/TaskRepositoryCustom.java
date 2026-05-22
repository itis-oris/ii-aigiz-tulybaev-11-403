package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.enums.TaskStatus;

import java.util.List;
import java.util.UUID;

public interface TaskRepositoryCustom {

    List<Task> findByFilters(
        UUID organizationId,
        UUID projectId,
        UUID assigneeId,
        UUID creatorId,
        TaskStatus status,
        Integer priority,
        String search
    );
}
