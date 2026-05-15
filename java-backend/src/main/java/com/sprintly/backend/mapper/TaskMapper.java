package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.task.TaskResponse;
import com.sprintly.backend.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
            .id(task.getId())
            .title(task.getTitle())
            .description(task.getDescription())
            .status(task.getStatus())
            .storyPoints(task.getStoryPoints())
            .priority(task.getPriority())
            .dueDate(task.getDueDate())
            .position(task.getPosition())
            .createdAt(task.getCreatedAt())
            .updatedAt(task.getUpdatedAt())
            .deletedAt(task.getDeletedAt())
            .projectId(task.getProject() != null ? task.getProject().getId() : null)
            .projectName(task.getProject() != null ? task.getProject().getName() : null)
            .boardId(task.getBoard() != null ? task.getBoard().getId() : null)
            .boardName(task.getBoard() != null ? task.getBoard().getName() : null)
            .columnId(task.getColumn() != null ? task.getColumn().getId() : null)
            .columnName(task.getColumn() != null ? task.getColumn().getName() : null)
            .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
            .assigneeEmail(task.getAssignee() != null ? task.getAssignee().getEmail() : null)
            .creatorId(task.getCreator() != null ? task.getCreator().getId() : null)
            .creatorEmail(task.getCreator() != null ? task.getCreator().getEmail() : null)
            .build();
    }
}
