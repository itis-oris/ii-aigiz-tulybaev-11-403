package com.sprintly.backend.controller;

import com.sprintly.backend.dto.comment.CommentResponse;
import com.sprintly.backend.dto.comment.CreateCommentRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Эндпоинты управления комментариями")
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    @Operation(summary = "Получить комментарии задачи")
    public List<CommentResponse> findAllByTask(
        @RequestParam UUID taskId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return commentService.findAllByTask(taskId, currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать комментарий")
    public CommentResponse create(
        @Valid @RequestBody CreateCommentRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return commentService.create(request, currentUser);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Удалить комментарий")
    public void delete(
        @PathVariable UUID commentId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        commentService.delete(commentId, currentUser);
    }
}
