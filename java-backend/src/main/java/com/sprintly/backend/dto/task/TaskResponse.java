package com.sprintly.backend.dto.task;

import com.sprintly.backend.entity.enums.TaskStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class TaskResponse {

    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private Integer storyPoints;
    private Integer priority;
    private OffsetDateTime dueDate;
    private Long position;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
    private UUID projectId;
    private String projectName;
    private UUID boardId;
    private String boardName;
    private UUID columnId;
    private String columnName;
    private UUID assigneeId;
    private String assigneeEmail;
    private UUID creatorId;
    private String creatorEmail;
}
