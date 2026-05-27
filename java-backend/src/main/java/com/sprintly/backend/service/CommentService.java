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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
    private final ProjectAccessService projectAccessService;

    @Transactional(readOnly = true)
    public List<CommentResponse> findAllByTask(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, task.getProject(), "Insufficient permissions for comment access");
        List<CommentResponse> responses = new ArrayList<>();
        for (Comment comment : commentRepository.findAllByTask_IdOrderByCreatedAtAsc(task.getId())) {
            responses.add(commentMapper.toResponse(comment));
        }

        return responses;
    }

    @Transactional
    public CommentResponse create(CreateCommentRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(request.getTaskId(), currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, task.getProject(), "Insufficient permissions for comment creation");
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

        if (!belongsToOrganization(comment, currentUser.getOrganizationId())) {
            throw new AccessDeniedException("Comment does not belong to current organization");
        }

        projectAccessService.ensureCommentDeletable(currentUser, comment, "Недостаточно прав для удаления комментария");

        commentRepository.delete(comment);
    }

    private Task getTaskInOrganization(UUID taskId, UUID organizationId) {
        Task task = taskRepository.findByIdAndDeletedAtIsNull(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!belongsToOrganization(task, organizationId)) {
            throw new AccessDeniedException("Task does not belong to current organization");
        }

        return task;
    }

    private User getUserInOrganization(UUID userId, UUID organizationId) {
        User user = userRepository.findByIdAndOrganizations_Id(userId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user;
    }

    private boolean belongsToOrganization(Comment comment, UUID organizationId) {
        return comment.getTask() != null
            && belongsToOrganization(comment.getTask(), organizationId);
    }

    private boolean belongsToOrganization(Task task, UUID organizationId) {
        return task.getProject() != null
            && task.getProject().getOrganization() != null
            && organizationId.equals(task.getProject().getOrganization().getId());
    }
}
