package com.sprintly.backend.service;

import com.sprintly.backend.dto.comment.CommentResponse;
import com.sprintly.backend.dto.comment.CreateCommentRequest;
import com.sprintly.backend.entity.Comment;
import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.CommentMapper;
import com.sprintly.backend.repository.CommentRepository;
import com.sprintly.backend.repository.TaskRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Transactional(readOnly = true)
    public List<CommentResponse> findAllByTask(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        return commentRepository.findAllByTask_IdOrderByCreatedAtAsc(task.getId()).stream()
            .map(commentMapper::toResponse)
            .toList();
    }

    @Transactional
    public CommentResponse create(CreateCommentRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(request.getTaskId(), currentUser.getOrganizationId());
        User user = getUserInOrganization(currentUser.getId(), currentUser.getOrganizationId());

        Comment comment = commentRepository.save(Comment.builder()
            .task(task)
            .user(user)
            .text(request.getText().trim())
            .createdAt(OffsetDateTime.now())
            .build());

        return commentMapper.toResponse(comment);
    }

    @Transactional
    public void delete(UUID commentId, CustomUserDetails currentUser) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (comment.getTask() == null || comment.getTask().getProject() == null
            || comment.getTask().getProject().getOrganization() == null
            || !currentUser.getOrganizationId().equals(comment.getTask().getProject().getOrganization().getId())) {
            throw new AccessDeniedException("Comment does not belong to current organization");
        }

        boolean isOwner = comment.getUser() != null && currentUser.getId().equals(comment.getUser().getId());
        boolean isManager = currentUser.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                || authority.getAuthority().equals("ROLE_MANAGER"));

        if (!isOwner && !isManager) {
            throw new AccessDeniedException("Недостаточно прав для удаления комментария");
        }

        commentRepository.delete(comment);
    }

    private Task getTaskInOrganization(UUID taskId, UUID organizationId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Task not found");
        }

        if (task.getProject() == null || task.getProject().getOrganization() == null
            || !organizationId.equals(task.getProject().getOrganization().getId())) {
            throw new AccessDeniedException("Task does not belong to current organization");
        }

        return task;
    }

    private User getUserInOrganization(UUID userId, UUID organizationId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOrganization() == null || !organizationId.equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("User does not belong to current organization");
        }

        return user;
    }
}
