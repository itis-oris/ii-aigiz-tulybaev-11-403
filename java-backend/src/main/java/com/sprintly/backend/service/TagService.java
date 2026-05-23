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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TagMapper tagMapper;
    private final ProjectAccessService projectAccessService;
    private final CachedViewService cachedViewService;
    private final CacheInvalidationService cacheInvalidationService;

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
        projectAccessService.ensureProjectMember(currentUser, project, "Insufficient permissions for tag access");
        return cachedViewService.getProjectTags(project.getId());
    }

    @Transactional(readOnly = true)
    public List<TagResponse> findAllByTask(UUID taskId, CustomUserDetails currentUser) {
        Task task = getTaskInOrganization(taskId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, task.getProject(), "Insufficient permissions for tag access");

        List<TagResponse> responses = new ArrayList<>();
        for (Tag tag : task.getTags()) {
            if (tag.getDeletedAt() == null) {
                responses.add(tagMapper.toResponse(tag));
            }
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public TagResponse findById(UUID tagId, CustomUserDetails currentUser) {
        Tag tag = getTagInOrganization(tagId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, tag.getProject(), "Insufficient permissions for tag access");
        return cachedViewService.getTag(tag.getId());
    }

    @Transactional
    public TagResponse create(CreateTagRequest request, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(request.getProjectId(), currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for tag creation");

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
        cacheInvalidationService.evictProjectTags(project.getId());
        cacheInvalidationService.evictTag(tag.getId());

        return tagMapper.toResponse(tag);
    }

    @Transactional
    public TagResponse update(UUID tagId, UpdateTagRequest request, CustomUserDetails currentUser) {
        Tag tag = getTagInOrganization(tagId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, tag.getProject(), "Insufficient permissions for tag update");

        String normalizedName = request.getName().trim();
        String normalizedColor = request.getColor().trim().toUpperCase();
        ensureUniqueTagName(tag.getProject().getId(), normalizedName, tag.getId());

        tag.setName(normalizedName);
        tag.setColor(normalizedColor);
        tag.setUpdatedAt(OffsetDateTime.now());
        Tag savedTag = tagRepository.save(tag);
        cacheInvalidationService.evictProjectTags(savedTag.getProject().getId());
        cacheInvalidationService.evictTag(savedTag.getId());
        return tagMapper.toResponse(savedTag);
    }

    @Transactional
    public void delete(UUID tagId, CustomUserDetails currentUser) {
        Tag tag = getTagInOrganization(tagId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, tag.getProject(), "Insufficient permissions for tag deletion");

        tag.setDeletedAt(OffsetDateTime.now());
        tag.setUpdatedAt(OffsetDateTime.now());
        tagRepository.save(tag);
        cacheInvalidationService.evictProjectTags(tag.getProject().getId());
        cacheInvalidationService.evictTag(tag.getId());
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

        if (!belongsToOrganization(tag, organizationId)) {
            throw new AccessDeniedException("Tag does not belong to current organization");
        }

        return tag;
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!belongsToOrganization(project, organizationId)) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private Task getTaskInOrganization(UUID taskId, UUID organizationId) {
        Task task = taskRepository.findByIdAndDeletedAtIsNull(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!belongsToOrganization(task, organizationId)) {
            throw new AccessDeniedException("Task does not belong to current organization");
        }

        return task;
    }

    private boolean belongsToOrganization(Tag tag, UUID organizationId) {
        return tag.getProject() != null
            && belongsToOrganization(tag.getProject(), organizationId);
    }

    private boolean belongsToOrganization(Task task, UUID organizationId) {
        return task.getProject() != null
            && belongsToOrganization(task.getProject(), organizationId);
    }

    private boolean belongsToOrganization(Project project, UUID organizationId) {
        return project.getOrganization() != null
            && organizationId.equals(project.getOrganization().getId());
    }

}
