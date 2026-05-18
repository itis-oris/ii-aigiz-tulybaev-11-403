package com.sprintly.backend.controller;

import com.sprintly.backend.dto.project.CreateProjectRequest;
import com.sprintly.backend.dto.project.ProjectResponse;
import com.sprintly.backend.dto.project.UpdateProjectRequest;
import com.sprintly.backend.dto.project.AddProjectMembersRequest;
import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.ProjectService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "List projects", description = "Returns all active projects in current organization")
    public List<ProjectResponse> findAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return projectService.findAll(currentUser);
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project by id")
    public ProjectResponse findById(
        @PathVariable UUID projectId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.findById(projectId, currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create project")
    public ProjectResponse create(
        @Valid @RequestBody CreateProjectRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.create(request, currentUser);
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update project")
    public ProjectResponse update(
        @PathVariable UUID projectId,
        @Valid @RequestBody UpdateProjectRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.update(projectId, request, currentUser);
    }

    @DeleteMapping("/{projectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete project")
    public void delete(
        @PathVariable UUID projectId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        projectService.delete(projectId, currentUser);
    }

    @PostMapping("/{projectId}/image")
    @Operation(summary = "Upload project image")
    public ProjectResponse uploadImage(
        @PathVariable UUID projectId,
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.uploadImage(projectId, file, currentUser);
    }

    @GetMapping("/{projectId}/members")
    @Operation(summary = "List project members")
    public List<UserResponse> findMembers(
        @PathVariable UUID projectId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.findMembers(projectId, currentUser);
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "Add project members")
    public List<UserResponse> addMembers(
        @PathVariable UUID projectId,
        @Valid @RequestBody AddProjectMembersRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.addMembers(projectId, request, currentUser);
    }
}
