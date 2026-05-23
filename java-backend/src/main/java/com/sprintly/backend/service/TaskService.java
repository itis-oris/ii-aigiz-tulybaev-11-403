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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
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
    private final ProjectAccessService projectAccessService;

    @Transactional
    public TaskResponse create(CreateTaskRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, project, "Insufficient permissions for task creation");
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
            Project project = getProjectInOrganization(filter.getProjectId(), currentUser.getOrganizationId());
            projectAccessService.ensureProjectMember(currentUser, project, "Insufficient permissions for task access");
        }

        if (filter.getAssigneeId() != null) {
            getUserInOrganization(filter.getAssigneeId(), currentUser.getOrganizationId());
        }

        if (filter.getCreatorId() != null) {
            getUserInOrganization(filter.getCreatorId(), currentUser.getOrganizationId());
        }

        List<Task> tasks = findTasksByFilter(filter, currentUser.getOrganizationId());

        List<TaskResponse> responses = new ArrayList<>();
        for (Task task : tasks) {
            if (projectAccessService.isProjectMember(currentUser, task.getProject())) {
                responses.add(taskMapper.toResponse(task));
            }
        }

        return responses;
    }

    private List<Task> findTasksByFilter(TaskFilterRequest filter, UUID organizationId) {
        if (canUseTagQuery(filter)) {
            return taskRepository.findActiveTasksByOrganizationAndTagIds(organizationId, filter.getTagIds());
        }

        return taskRepository.findByFilters(
            organizationId,
            filter.getProjectId(),
            filter.getAssigneeId(),
            filter.getCreatorId(),
            filter.getStatus(),
            filter.getPriority(),
            filter.getSearch(),
            filter.getTagIds()
        );
    }

    private boolean canUseTagQuery(TaskFilterRequest filter) {
        return hasItems(filter.getTagIds())
            && filter.getProjectId() == null
            && filter.getAssigneeId() == null
            && filter.getCreatorId() == null
            && filter.getStatus() == null
            && filter.getPriority() == null
            && !hasText(filter.getSearch());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean hasItems(List<UUID> values) {
        return values != null && !values.isEmpty();
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, task.getProject(), "Insufficient permissions for task access");
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse update(UUID taskId, UpdateTaskRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        projectAccessService.ensureTaskEditor(currentUser, task, "Insufficient permissions for task update");

        updateTaskColumn(task, request);
        updateTaskAssignee(task, request, currentUser.getOrganizationId());
        updateTaskTags(task, request, task.getProject(), currentUser.getOrganizationId());
        updateTaskFields(task, request);
        task.setUpdatedAt(OffsetDateTime.now());

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse assign(UUID taskId, AssignTaskRequest request, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, task.getProject(), "Insufficient permissions for task assignment");
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
        projectAccessService.ensureProjectMember(currentUser, task.getProject(), "Insufficient permissions for task move");
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
        projectAccessService.ensureTaskStatusUpdater(currentUser, task, "Insufficient permissions for task status update");
        task.setStatus(request.getStatus());
        task.setUpdatedAt(OffsetDateTime.now());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        projectAccessService.ensureTaskEditor(currentUser, task, "Insufficient permissions for task deletion");

        task.setDeletedAt(OffsetDateTime.now());
        task.setUpdatedAt(OffsetDateTime.now());
        taskRepository.save(task);
    }

    private Task getTaskInOrganization(UUID taskId, UUID organizationId) {
        Task task = taskRepository.findByIdAndDeletedAtIsNull(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

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
        Project project = projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getOrganization() == null || !organizationId.equals(project.getOrganization().getId())) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private Board getBoardInProject(UUID boardId, UUID projectId) {
        return boardRepository.findByIdAndProject_IdAndDeletedAtIsNull(boardId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
    }

    private BoardColumn getColumnInBoard(UUID columnId, UUID boardId) {
        return boardColumnRepository.findByIdAndBoard_IdAndDeletedAtIsNull(columnId, boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
    }

    private User getUserInOrganization(UUID userId, UUID organizationId) {
        User user = userRepository.findByIdAndOrganizations_Id(userId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user;
    }

    private void updateTaskColumn(Task task, UpdateTaskRequest request) {
        if (request.getColumnId() != null) {
            if (task.getBoard() == null) {
                throw new IllegalArgumentException("Task must belong to a board");
            }
            task.setColumn(getColumnInBoard(request.getColumnId(), task.getBoard().getId()));
        }
    }

    private void updateTaskAssignee(Task task, UpdateTaskRequest request, UUID organizationId) {
        if (request.getAssigneeId() != null) {
            task.setAssignee(getUserInOrganization(request.getAssigneeId(), organizationId));
        }
    }

    private void updateTaskTags(Task task, UpdateTaskRequest request, Project project, UUID organizationId) {
        if (request.getTagIds() != null) {
            if (project == null) {
                throw new IllegalArgumentException("Task must belong to a project");
            }
            task.setTags(resolveTags(request.getTagIds(), project, organizationId));
        }
    }

    private void updateTaskFields(Task task, UpdateTaskRequest request) {
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
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }
    }

    private Set<Tag> resolveTags(List<UUID> tagIds, Project project, UUID organizationId) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Set<UUID> uniqueTagIds = new LinkedHashSet<>(tagIds);
        List<Tag> foundTags = tagRepository.findAllByIdInAndDeletedAtIsNull(uniqueTagIds);
        Map<UUID, Tag> tagsById = new HashMap<>();
        for (Tag tag : foundTags) {
            tagsById.put(tag.getId(), tag);
        }

        if (tagsById.size() != uniqueTagIds.size()) {
            throw new ResourceNotFoundException("Tag not found");
        }

        Set<Tag> tags = new LinkedHashSet<>();
        for (UUID tagId : uniqueTagIds) {
            Tag tag = tagsById.get(tagId);

            if (!belongsToOrganization(tag, organizationId)) {
                throw new AccessDeniedException("Tag does not belong to current organization");
            }

            if (!project.getId().equals(tag.getProject().getId())) {
                throw new IllegalArgumentException("Tag does not belong to selected project");
            }

            tags.add(tag);
        }

        return tags;
    }

    private boolean belongsToOrganization(Tag tag, UUID organizationId) {
        return tag.getProject() != null
            && tag.getProject().getOrganization() != null
            && organizationId.equals(tag.getProject().getOrganization().getId());
    }

}
