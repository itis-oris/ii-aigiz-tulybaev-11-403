package com.sprintly.backend.service;

import com.sprintly.backend.entity.Comment;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.Task;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.repository.ProjectMemberRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {

    private final ProjectMemberRepository projectMemberRepository;

    @Transactional(readOnly = true)
    public boolean isOrgAdmin(CustomUserDetails currentUser, Organization organization) {
        return organization != null
            && organization.getOwnerId() != null
            && organization.getOwnerId().equals(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public boolean isProjectMember(CustomUserDetails currentUser, Project project) {
        if (project == null) {
            return false;
        }

        if (isOrgAdmin(currentUser, project.getOrganization())) {
            return true;
        }

        if (isProjectOwner(currentUser.getId(), project)) {
            return true;
        }

        return projectMemberRepository.existsByProject_IdAndUser_Id(project.getId(), currentUser.getId());
    }

    @Transactional(readOnly = true)
    public boolean isProjectOwner(CustomUserDetails currentUser, Project project) {
        if (project == null) {
            return false;
        }

        if (isOrgAdmin(currentUser, project.getOrganization())) {
            return true;
        }

        if (isProjectOwner(currentUser.getId(), project)) {
            return true;
        }

        return false;
    }

    @Transactional(readOnly = true)
    public boolean isProjectMember(User user, Project project) {
        if (project == null || user == null) {
            return false;
        }

        if (isProjectOwner(user.getId(), project)) {
            return true;
        }

        return projectMemberRepository.existsByProject_IdAndUser_Id(project.getId(), user.getId());
    }

    @Transactional(readOnly = true)
    public boolean isProjectOwner(User user, Project project) {
        if (project == null || user == null) {
            return false;
        }

        if (isProjectOwner(user.getId(), project)) {
            return true;
        }

        return false;
    }

    @Transactional(readOnly = true)
    public boolean canEditTask(CustomUserDetails currentUser, Task task) {
        if (task == null || task.getProject() == null) {
            return false;
        }

        return isProjectMember(currentUser, task.getProject());
    }

    @Transactional(readOnly = true)
    public boolean canChangeTaskStatus(CustomUserDetails currentUser, Task task) {
        if (task == null || task.getProject() == null) {
            return false;
        }

        return isProjectMember(currentUser, task.getProject());
    }

    @Transactional(readOnly = true)
    public boolean canDeleteComment(CustomUserDetails currentUser, Comment comment) {
        if (comment == null || comment.getTask() == null || comment.getTask().getProject() == null) {
            return false;
        }

        if (isProjectOwner(currentUser, comment.getTask().getProject())) {
            return true;
        }

        return comment.getUser() != null && currentUser.getId().equals(comment.getUser().getId());
    }

    @Transactional
    public void ensureProjectOwner(CustomUserDetails currentUser, Project project, String message) {
        if (!isProjectOwner(currentUser, project)) {
            throw new AccessDeniedException(message);
        }
    }

    @Transactional
    public void ensureProjectMember(CustomUserDetails currentUser, Project project, String message) {
        if (!isProjectMember(currentUser, project)) {
            throw new AccessDeniedException(message);
        }
    }

    @Transactional
    public void ensureTaskEditor(CustomUserDetails currentUser, Task task, String message) {
        if (!canEditTask(currentUser, task)) {
            throw new AccessDeniedException(message);
        }
    }

    @Transactional
    public void ensureTaskStatusUpdater(CustomUserDetails currentUser, Task task, String message) {
        if (!canChangeTaskStatus(currentUser, task)) {
            throw new AccessDeniedException(message);
        }
    }

    @Transactional
    public void ensureCommentDeletable(CustomUserDetails currentUser, Comment comment, String message) {
        if (!canDeleteComment(currentUser, comment)) {
            throw new AccessDeniedException(message);
        }
    }

    @Transactional
    public void ensureOrgAdmin(CustomUserDetails currentUser, Organization organization, String message) {
        if (!isOrgAdmin(currentUser, organization)) {
            throw new AccessDeniedException(message);
        }
    }

    private boolean isProjectOwner(UUID userId, Project project) {
        return project.getOwner() != null && userId.equals(project.getOwner().getId());
    }
}
