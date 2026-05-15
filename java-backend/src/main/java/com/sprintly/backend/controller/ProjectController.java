package com.sprintly.backend.controller;

import com.sprintly.backend.dto.project.CreateProjectRequest;
import com.sprintly.backend.dto.project.ProjectResponse;
import com.sprintly.backend.dto.project.UpdateProjectRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectResponse> findAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return projectService.findAll(currentUser);
    }

    @GetMapping("/{projectId}")
    public ProjectResponse findById(
        @PathVariable UUID projectId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.findById(projectId, currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(
        @Valid @RequestBody CreateProjectRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.create(request, currentUser);
    }

    @PutMapping("/{projectId}")
    public ProjectResponse update(
        @PathVariable UUID projectId,
        @Valid @RequestBody UpdateProjectRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectService.update(projectId, request, currentUser);
    }

    @DeleteMapping("/{projectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable UUID projectId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        projectService.delete(projectId, currentUser);
    }
}
