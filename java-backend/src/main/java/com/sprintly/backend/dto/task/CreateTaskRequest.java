package com.sprintly.backend.dto.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CreateTaskRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 5000)
    private String description;

    @Min(0)
    @Max(100)
    private Integer storyPoints;

    @Min(0)
    @Max(10)
    private Integer priority;

    private OffsetDateTime dueDate;

    private Boolean isPrivate;

    @NotNull
    private UUID projectId;

    @NotNull
    private UUID boardId;

    @NotNull
    private UUID columnId;

    private UUID assigneeId;

    private List<UUID> tagIds;

    @Min(0)
    private Long position;
}
