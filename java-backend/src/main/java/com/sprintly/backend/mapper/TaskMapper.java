package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.tag.TagResponse;
import com.sprintly.backend.dto.task.TaskResponse;
import com.sprintly.backend.entity.Tag;
import com.sprintly.backend.entity.Task;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class TaskMapper {

    private final TagMapper tagMapper;

    public TaskMapper(TagMapper tagMapper) {
        this.tagMapper = tagMapper;
    }

    public TaskResponse toResponse(Task task) {
        List<TagResponse> tags = getTags(task);

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
            .tags(tags)
            .build();
    }

    private List<TagResponse> getTags(Task task) {
        List<TagResponse> tags = new ArrayList<>();
        TagResponse boardTag = getBoardTag(task);
        if (boardTag != null) {
            tags.add(boardTag);
        }

        for (TagResponse tag : getCustomTags(task)) {
            tags.add(tag);
        }

        return tags;
    }

    private List<TagResponse> getCustomTags(Task task) {
        List<Tag> tags = new ArrayList<>();
        for (Tag tag : task.getTags()) {
            if (tag.getDeletedAt() == null) {
                tags.add(tag);
            }
        }

        tags.sort(Comparator.comparing(tag -> tag.getName().toLowerCase()));

        List<TagResponse> responses = new ArrayList<>();
        for (Tag tag : tags) {
            responses.add(tagMapper.toResponse(tag));
        }

        return responses;
    }

    private TagResponse getBoardTag(Task task) {
        if (task.getBoard() == null) {
            return null;
        }

        return TagResponse.builder()
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
    }
}
