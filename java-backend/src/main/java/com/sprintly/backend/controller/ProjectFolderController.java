package com.sprintly.backend.controller;

import com.sprintly.backend.dto.projectfolder.CreateProjectFolderRequest;
import com.sprintly.backend.dto.projectfolder.ProjectFolderResponse;
import com.sprintly.backend.dto.projectfolder.UpdateProjectFolderRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.ProjectFolderService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/project-folders")
@RequiredArgsConstructor
@Tag(name = "Project Folders", description = "Project folder management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ProjectFolderController {

    private final ProjectFolderService projectFolderService;

    @GetMapping
    @Operation(summary = "List project folders", description = "Returns all active project folders in current organization")
    public List<ProjectFolderResponse> findAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return projectFolderService.findAll(currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create project folder")
    public ProjectFolderResponse create(
        @Valid @RequestBody CreateProjectFolderRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectFolderService.create(request, currentUser);
    }

    @PutMapping("/{folderId}")
    @Operation(summary = "Update project folder")
    public ProjectFolderResponse update(
        @PathVariable UUID folderId,
        @Valid @RequestBody UpdateProjectFolderRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return projectFolderService.update(folderId, request, currentUser);
    }

    @DeleteMapping("/{folderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete project folder")
    public void delete(
        @PathVariable UUID folderId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        projectFolderService.delete(folderId, currentUser);
    }
}
