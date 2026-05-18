package com.sprintly.backend.service;

import com.sprintly.backend.dto.tag.CreateTagRequest;
import com.sprintly.backend.dto.tag.TagResponse;
import com.sprintly.backend.dto.tag.UpdateTagRequest;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.Tag;
import com.sprintly.backend.entity.Task;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.TagMapper;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.repository.TagRepository;
import com.sprintly.backend.repository.TaskRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TagMapper tagMapper;

    @Transactional(readOnly = true)
    public List<TagResponse> findAll(UUID projectId, UUID taskId, CustomUserDetails currentUser) {
        if (taskId != null) {
            return findAllByTask(taskId, currentUser);
        }

        if (projectId != null) {
            return findAllByProject(projectId, currentUser);
        }

        throw new IllegalArgumentException("Either projectId or taskId is required");
    }

    @Transactional(readOnly = true)
    public List<TagResponse> findAllByProject(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, project, "Insufficient permissions for tag access");

        return tagRepository.findAllByProject_IdAndDeletedAtIsNullOrderByNameAsc(project.getId()).stream()
            .map(tagMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TagResponse> findAllByTask(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, task.getProject(), "Insufficient permissions for tag access");

        return task.getTags().stream()
            .filter(tag -> tag.getDeletedAt() == null)
            .map(tagMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public TagResponse findById(UUID tagId, CustomUserDetails currentUser) {
        return tagMapper.toResponse(getTagInOrganization(tagId, currentUser.getOrganizationId()));
    }

    @Transactional
    public TagResponse create(CreateTagRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, project, "Insufficient permissions for tag creation");

        String normalizedName = request.getName().trim();
        String normalizedColor = request.getColor().trim().toUpperCase();
        ensureUniqueTagName(project.getId(), normalizedName, null);

        Tag tag = tagRepository.save(Tag.builder()
            .name(normalizedName)
            .color(normalizedColor)
            .createdAt(OffsetDateTime.now())
            .updatedAt(OffsetDateTime.now())
            .project(project)
            .build());

        return tagMapper.toResponse(tag);
    }

    @Transactional
    public TagResponse update(UUID tagId, UpdateTagRequest request, CustomUserDetails currentUser) {
        Tag tag = getTagInOrganization(tagId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, tag.getProject(), "Insufficient permissions for tag update");

        String normalizedName = request.getName().trim();
        String normalizedColor = request.getColor().trim().toUpperCase();
        ensureUniqueTagName(tag.getProject().getId(), normalizedName, tag.getId());

        tag.setName(normalizedName);
        tag.setColor(normalizedColor);
        tag.setUpdatedAt(OffsetDateTime.now());

        return tagMapper.toResponse(tagRepository.save(tag));
    }

    @Transactional
    public void delete(UUID tagId, CustomUserDetails currentUser) {
        Tag tag = getTagInOrganization(tagId, currentUser.getOrganizationId());
        ensureManagerOrProjectMemberAccess(currentUser, tag.getProject(), "Insufficient permissions for tag deletion");

        if (tag.getDeletedAt() != null) {
            throw new IllegalStateException("Tag already deleted");
        }

        tag.setDeletedAt(OffsetDateTime.now());
        tag.setUpdatedAt(OffsetDateTime.now());
        tagRepository.save(tag);
    }

    private void ensureUniqueTagName(UUID projectId, String name, UUID excludedTagId) {
        boolean exists = excludedTagId == null
            ? tagRepository.existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCase(projectId, name)
            : tagRepository.existsByProject_IdAndDeletedAtIsNullAndNameIgnoreCaseAndIdNot(projectId, name, excludedTagId);

        if (exists) {
            throw new IllegalArgumentException("Tag with this name already exists in the project");
        }
    }

    private Tag getTagInOrganization(UUID tagId, UUID organizationId) {
        Tag tag = tagRepository.findByIdAndDeletedAtIsNull(tagId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

        if (tag.getProject() == null || tag.getProject().getOrganization() == null
            || !organizationId.equals(tag.getProject().getOrganization().getId())) {
            throw new AccessDeniedException("Tag does not belong to current organization");
        }

        return tag;
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findWithMembersByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getOrganization() == null || !organizationId.equals(project.getOrganization().getId())) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
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
}
