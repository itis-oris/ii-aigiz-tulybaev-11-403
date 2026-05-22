package com.sprintly.backend.service;

import com.sprintly.backend.dto.project.AddProjectMembersRequest;
import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.entity.Project;
import com.sprintly.backend.entity.ProjectMember;
import com.sprintly.backend.entity.ProjectMemberId;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.ProjectRole;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.mapper.UserMapper;
import com.sprintly.backend.repository.ProjectMemberRepository;
import com.sprintly.backend.repository.ProjectRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ProjectAccessService projectAccessService;

    @Transactional(readOnly = true)
    public List<UserResponse> findMembers(UUID projectId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectMember(currentUser, project, "Insufficient permissions for project access");

        return getMemberResponses(project);
    }

    @Transactional
    public List<UserResponse> addMembers(
        UUID projectId,
        AddProjectMembersRequest request,
        CustomUserDetails currentUser
    ) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for project modification");

        Set<UUID> userIds = new HashSet<>(request.getUserIds());
        List<User> users = userRepository.findAllByIdInAndOrganizations_Id(userIds, currentUser.getOrganizationId());

        if (users.size() != userIds.size()) {
            throw new ResourceNotFoundException("Some users were not found in current organization");
        }

        for (User user : users) {
            ensureProjectMembership(project, user);
        }

        return getMemberResponses(project);
    }

    @Transactional
    public List<UserResponse> removeMember(UUID projectId, UUID userId, CustomUserDetails currentUser) {
        Project project = getProjectInOrganization(projectId, currentUser.getOrganizationId());
        projectAccessService.ensureProjectOwner(currentUser, project, "Insufficient permissions for project modification");

        User user = getUserInOrganization(userId, currentUser.getOrganizationId());
        ensureProjectMemberExists(project, user);
        ensureOwnerIsNotRemoved(project, user);

        removeProjectMembership(project, user);

        return getMemberResponses(project);
    }

    @Transactional
    public void ensureProjectMembership(Project project, User user) {
        assignProjectRole(project, user, ProjectRole.PROJECT_MEMBER);
    }

    private Project getProjectInOrganization(UUID projectId, UUID organizationId) {
        Project project = projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!belongsToOrganization(project, organizationId)) {
            throw new AccessDeniedException("Project does not belong to current organization");
        }

        return project;
    }

    private boolean belongsToOrganization(Project project, UUID organizationId) {
        return project.getOrganization() != null
            && organizationId.equals(project.getOrganization().getId());
    }

    private User getUserInOrganization(UUID userId, UUID organizationId) {
        return userRepository.findByIdAndOrganizations_Id(userId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureProjectMemberExists(Project project, User user) {
        if (!projectAccessService.isProjectMember(user, project)) {
            throw new ResourceNotFoundException("Project member not found");
        }
    }

    private void ensureOwnerIsNotRemoved(Project project, User user) {
        if (isProjectOwner(project, user)) {
            throw new IllegalArgumentException("Project owner cannot be removed from the project");
        }
    }

    private boolean isProjectOwner(Project project, User user) {
        return project.getOwner() != null && project.getOwner().getId().equals(user.getId());
    }

    private List<UserResponse> getMemberResponses(Project project) {
        List<ProjectMember> members = new ArrayList<>(projectMemberRepository.findAllByProject_Id(project.getId()));
        members.sort(Comparator.comparing(projectMember -> projectMember.getUser().getEmail().toLowerCase()));

        List<UserResponse> responses = new ArrayList<>();
        for (ProjectMember projectMember : members) {
            responses.add(userMapper.toResponse(
                projectMember.getUser(),
                Set.of(resolveProjectRoleName(projectMember, project))
            ));
        }

        return responses;
    }

    private String resolveProjectRoleName(ProjectMember projectMember, Project project) {
        if (projectMember.getUser() != null && isProjectOwner(project, projectMember.getUser())) {
            return "OWNER";
        }

        return "MEMBER";
    }
    private void assignProjectRole(Project project, User user, ProjectRole role) {
        ProjectMemberId id = new ProjectMemberId(project.getId(), user.getId());
        Optional<ProjectMember> member = projectMemberRepository.findById(id);

        if (member.isPresent()) {
            ProjectMember existingMember = member.get();
            if (existingMember.getRole() == role) {
                return;
            }

            existingMember.setRole(role);
            projectMemberRepository.save(existingMember);
            return;
        }

        ProjectMember newMember = ProjectMember.builder()
            .id(id)
            .project(project)
            .user(user)
            .role(role)
            .build();

        projectMemberRepository.save(newMember);
    }

    private void removeProjectMembership(Project project, User user) {
        projectMemberRepository.deleteByProject_IdAndUser_Id(project.getId(), user.getId());
    }
}
