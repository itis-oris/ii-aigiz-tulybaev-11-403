package com.sprintly.backend.service;

import com.sprintly.backend.dto.task.AssignTaskRequest;
import com.sprintly.backend.dto.task.CreateTaskRequest;
import com.sprintly.backend.dto.task.MoveTaskRequest;
import com.sprintly.backend.dto.task.TaskFilterRequest;
import com.sprintly.backend.dto.task.TaskResponse;
import com.sprintly.backend.dto.task.UpdateTaskRequest;
import com.sprintly.backend.dto.task.UpdateTaskStatusRequest;
import com.sprintly.backend.entity.Board;
import com.sprintly.backend.entity.BoardColumn;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.Tag;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.TaskStatus;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.TaskMapper;
import com.sprintly.backend.repository.BoardColumnRepository;
import com.sprintly.backend.repository.BoardRepository;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.repository.TaskRepository;
import com.sprintly.backend.repository.TagRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final BoardRepository boardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final TaskMapper taskMapper;

    @Transactional
    public TaskResponse create(CreateTaskRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, project, "Insufficient permissions for task creation");
        Board board = getBoardInProject(request.getBoardId(), project.getId());
        BoardColumn column = getColumnInBoard(request.getColumnId(), board.getId());
        User creator = getUserInOrganization(currentUser.getId(), currentUser.getOrganizationId());
        User assignee = request.getAssigneeId() != null
            ? getUserInOrganization(request.getAssigneeId(), currentUser.getOrganizationId())
            : null;
        Set<Tag> tags = resolveTags(request.getTagIds(), project, currentUser.getOrganizationId());

        Task task = Task.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .status(TaskStatus.TODO)
            .storyPoints(request.getStoryPoints())
            .priority(request.getPriority())
            .dueDate(request.getDueDate())
            .isPrivate(Boolean.TRUE.equals(request.getIsPrivate()))
            .position(request.getPosition())
            .createdAt(OffsetDateTime.now())
            .updatedAt(OffsetDateTime.now())
            .project(project)
            .board(board)
            .column(column)
            .creator(creator)
            .assignee(assignee)
            .tags(tags)
            .build();

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findAll(TaskFilterRequest filter, CustomUserDetails currentUser) {
        if (filter.getProjectId() != null) {
            getProjectInOrganization(filter.getProjectId(), currentUser.getOrganizationId());
        }

        if (filter.getAssigneeId() != null) {
            getUserInOrganization(filter.getAssigneeId(), currentUser.getOrganizationId());
        }

        if (filter.getCreatorId() != null) {
            getUserInOrganization(filter.getCreatorId(), currentUser.getOrganizationId());
        }

        return taskRepository.findByFilters(
                currentUser.getOrganizationId(),
                filter.getProjectId(),
                filter.getAssigneeId(),
                filter.getCreatorId(),
                filter.getIsPrivate(),
                filter.getStatus(),
                filter.getPriority(),
                filter.getSearch()
            ).stream()
            .map(taskMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(UUID taskId, CustomUserDetails currentUser) {
        return taskMapper.toResponse(getTaskInOrganization(taskId, currentUser.getOrganizationId()));
    }

    @Transactional
    public TaskResponse update(UUID taskId, UpdateTaskRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, task.getProject(), "Insufficient permissions for task update");

        Project project = task.getProject();
        if (request.getProjectId() != null) {
            project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
            task.setProject(project);
        }

        Board board = task.getBoard();
        if (request.getBoardId() != null) {
            if (project == null) {
                throw new IllegalArgumentException("Task must belong to a project");
            }
            board = getBoardInProject(request.getBoardId(), project.getId());
            task.setBoard(board);
        }

        if (request.getColumnId() != null) {
            if (board == null) {
                throw new IllegalArgumentException("Task must belong to a board");
            }
            task.setColumn(getColumnInBoard(request.getColumnId(), board.getId()));
        }

        if (request.getAssigneeId() != null) {
            task.setAssignee(getUserInOrganization(request.getAssigneeId(), currentUser.getOrganizationId()));
        }
        if (request.getTagIds() != null) {
            if (project == null) {
                throw new IllegalArgumentException("Task must belong to a project");
            }
            task.setTags(resolveTags(request.getTagIds(), project, currentUser.getOrganizationId()));
        } else if (request.getProjectId() != null) {
            task.setTags(new LinkedHashSet<>());
        }

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStoryPoints() != null) {
            task.setStoryPoints(request.getStoryPoints());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getIsPrivate() != null) {
            task.setIsPrivate(request.getIsPrivate());
        }
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }

        task.setUpdatedAt(OffsetDateTime.now());

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse assign(UUID taskId, AssignTaskRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, task.getProject(), "Insufficient permissions for task assignment");
        User assignee = request.getAssigneeId() != null
            ? getUserInOrganization(request.getAssigneeId(), currentUser.getOrganizationId())
            : null;

        task.setAssignee(assignee);
        task.setUpdatedAt(OffsetDateTime.now());

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse move(UUID taskId, MoveTaskRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, task.getProject(), "Insufficient permissions for task move");
        BoardColumn column = getColumnInBoard(request.getColumnId(), task.getBoard().getId());

        task.setColumn(column);
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }
        task.setUpdatedAt(OffsetDateTime.now());

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(UUID taskId, UpdateTaskStatusRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberOrAssigneeAccess(currentUser, task);
        task.setStatus(request.getStatus());
        task.setUpdatedAt(OffsetDateTime.now());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, task.getProject(), "Insufficient permissions for task deletion");

        if (task.getDeletedAt() != null) {
            throw new IllegalStateException("Task already deleted");
        }

        task.setDeletedAt(OffsetDateTime.now());
        task.setUpdatedAt(OffsetDateTime.now());
        taskRepository.save(task);
    }

    private Task getTaskInOrganization(UUID taskId, UUID organizationId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Task not found");
        }

        if (!belongsToOrganization(task, organizationId)) {
            throw new AccessDeniedException("Task does not belong to current organization");
        }

        return task;
    }

    private boolean belongsToOrganization(Task task, UUID organizationId) {
        return task.getProject() != null
            && task.getProject().getOrganization() != null
            && organizationId.equals(task.getProject().getOrganization().getId());
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Project not found");
        }

        if (!organizationId.equals(project.getOrganization().getId())) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private Board getBoardInProject(UUID boardId, UUID projectId) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        if (board.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Board not found");
        }

        if (!projectId.equals(board.getProject().getId())) {
            throw new IllegalArgumentException("Board does not belong to selected project");
        }

        return board;
    }

    private BoardColumn getColumnInBoard(UUID columnId, UUID boardId) {
        BoardColumn column = boardColumnRepository.findById(columnId)
            .orElseThrow(() -> new ResourceNotFoundException("Column not found"));

        if (column.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Column not found");
        }

        if (!boardId.equals(column.getBoard().getId())) {
            throw new IllegalArgumentException("Column does not belong to selected board");
        }

        return column;
    }

    private User getUserInOrganization(UUID userId, UUID organizationId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!organizationId.equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("User does not belong to current organization");
        }

        return user;
    }

    private Set<Tag> resolveTags(List<UUID> tagIds, Project project, UUID organizationId) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Set<Tag> tags = new LinkedHashSet<>();
        for (UUID tagId : tagIds) {
            Tag tag = tagRepository.findByIdAndDeletedAtIsNull(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

            if (tag.getProject() == null || tag.getProject().getOrganization() == null
                || !organizationId.equals(tag.getProject().getOrganization().getId())) {
                throw new AccessDeniedException("Tag does not belong to current organization");
            }

            if (!project.getId().equals(tag.getProject().getId())) {
                throw new IllegalArgumentException("Tag does not belong to selected project");
            }

            tags.add(tag);
        }

        return tags;
    }

    private void ensureManagerAccess(CustomUserDetails currentUser, String message) {
        boolean hasAccess = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (!hasAccess) {
            throw new AccessDeniedException(message);
        }
    }

    private void ensureManagerOrProjectMemberAccess(
        CustomUserDetails currentUser,
        Project project,
        String message
    ) {
        boolean isManager = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));

        if (isManager) {
            return;
        }

        boolean isOwner = project.getOwner() != null
            && currentUser.getId().equals(project.getOwner().getId());
        boolean isMember = project.getMembers().stream()
            .anyMatch(member -> currentUser.getId().equals(member.getId()));

        if (!isOwner && !isMember) {
            throw new AccessDeniedException(message);
        }
    }

    private void ensureManagerOrProjectMemberOrAssigneeAccess(CustomUserDetails currentUser, Task task) {
        boolean isManager = currentUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_ADMIN") || authority.equals("ROLE_MANAGER"));
        if (isManager) {
            return;
        }

        Project project = task.getProject();
        boolean isOwner = project != null
            && project.getOwner() != null
            && currentUser.getId().equals(project.getOwner().getId());
        boolean isMember = project != null
            && project.getMembers().stream()
            .anyMatch(member -> currentUser.getId().equals(member.getId()));
        boolean isAssignee = task.getAssignee() != null
            && currentUser.getId().equals(task.getAssignee().getId());

        if (!isOwner && !isMember && !isAssignee) {
            throw new AccessDeniedException("Insufficient permissions for task status update");
        }
    }
}
