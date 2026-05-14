package com.sprintly.backend.repository;

import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.enums.TaskStatus;

import java.util.List;
import java.util.UUID;

public interface TaskRepositoryCustom {

    List<Task> findByFilters(UUID projectId, UUID assigneeId, TaskStatus status, Integer priority, String search);
}
