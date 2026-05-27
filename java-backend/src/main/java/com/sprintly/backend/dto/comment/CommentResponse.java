package com.sprintly.backend.dto.comment;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class CommentResponse {

    private UUID id;
    private UUID taskId;
    private UUID userId;
    private String userEmail;
    private String text;
    private OffsetDateTime createdAt;
}
