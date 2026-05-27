package com.sprintly.backend.controller;

import com.sprintly.backend.dto.tag.CreateTagRequest;
import com.sprintly.backend.dto.tag.TagResponse;
import com.sprintly.backend.dto.tag.UpdateTagRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.TagService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Tag management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "List tags by project or task")
    public List<TagResponse> findAll(
        @RequestParam(required = false) UUID projectId,
        @RequestParam(required = false) UUID taskId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return tagService.findAll(projectId, taskId, currentUser);
    }

    @GetMapping("/{tagId}")
    @Operation(summary = "Get tag by id")
    public TagResponse findById(
        @PathVariable UUID tagId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return tagService.findById(tagId, currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create tag")
    public TagResponse create(
        @Valid @RequestBody CreateTagRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return tagService.create(request, currentUser);
    }

    @PutMapping("/{tagId}")
    @Operation(summary = "Update tag")
    public TagResponse update(
        @PathVariable UUID tagId,
        @Valid @RequestBody UpdateTagRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return tagService.update(tagId, request, currentUser);
    }

    @DeleteMapping("/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete tag")
    public void delete(
        @PathVariable UUID tagId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        tagService.delete(tagId, currentUser);
    }
}
