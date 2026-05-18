package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.tag.TagResponse;
import com.sprintly.backend.dto.task.TaskResponse;
import com.sprintly.backend.entity.Task;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@Component
public class TaskMapper {

    private final TagMapper tagMapper;

    public TaskMapper(TagMapper tagMapper) {
        this.tagMapper = tagMapper;
    }

    public TaskResponse toResponse(Task task) {
        List<TagResponse> customTags = task.getTags().stream()
            .filter(tag -> tag.getDeletedAt() == null)
            .sorted(Comparator.comparing(tag -> tag.getName().toLowerCase()))
            .map(tagMapper::toResponse)
            .toList();
        TagResponse boardTag = task.getBoard() == null ? null : TagResponse.builder()
            .id(task.getBoard().getId())
            .name(task.getBoard().getName())
            .color("#334155")
            .system(true)
            .projectId(task.getProject() != null ? task.getProject().getId() : null)
            .projectName(task.getProject() != null ? task.getProject().getName() : null)
            .createdAt(task.getCreatedAt())
            .updatedAt(task.getUpdatedAt())
            .deletedAt((OffsetDateTime) null)
            .build();
        List<TagResponse> tags = boardTag == null
            ? customTags
            : java.util.stream.Stream.concat(java.util.stream.Stream.of(boardTag), customTags.stream()).toList();

        return TaskResponse.builder()
            .id(task.getId())
            .title(task.getTitle())
            .description(task.getDescription())
            .status(task.getStatus())
            .storyPoints(task.getStoryPoints())
            .priority(task.getPriority())
            .dueDate(task.getDueDate())
            .isPrivate(task.getIsPrivate())
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
            .tags(tags)
            .build();
    }
}
