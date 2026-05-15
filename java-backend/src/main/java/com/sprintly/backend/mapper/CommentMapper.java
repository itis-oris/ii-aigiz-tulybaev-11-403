package com.sprintly.backend.mapper;

import com.sprintly.backend.dto.comment.CommentResponse;
import com.sprintly.backend.entity.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
            .id(comment.getId())
            .taskId(comment.getTask() != null ? comment.getTask().getId() : null)
            .userId(comment.getUser() != null ? comment.getUser().getId() : null)
            .userEmail(comment.getUser() != null ? comment.getUser().getEmail() : null)
            .text(comment.getText())
            .createdAt(comment.getCreatedAt())
            .build();
    }
}
