package com.sprintly.backend.controller;

import com.sprintly.backend.dto.task.AssignTaskRequest;
import com.sprintly.backend.dto.task.CreateTaskRequest;
import com.sprintly.backend.dto.task.MoveTaskRequest;
import com.sprintly.backend.dto.task.TaskFilterRequest;
import com.sprintly.backend.dto.task.TaskResponse;
import com.sprintly.backend.dto.task.UpdateTaskRequest;
import com.sprintly.backend.dto.task.UpdateTaskStatusRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(
        @Valid @RequestBody CreateTaskRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.create(request, currentUser);
    }

    @GetMapping
    public List<TaskResponse> findAll(
        TaskFilterRequest filter,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.findAll(filter, currentUser);
    }

    @GetMapping("/{taskId}")
    public TaskResponse findById(
        @PathVariable UUID taskId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.findById(taskId, currentUser);
    }

    @PutMapping("/{taskId}")
    public TaskResponse update(
        @PathVariable UUID taskId,
        @Valid @RequestBody UpdateTaskRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.update(taskId, request, currentUser);
    }

    @PatchMapping("/{taskId}/assign")
    public TaskResponse assign(
        @PathVariable UUID taskId,
        @RequestBody AssignTaskRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.assign(taskId, request, currentUser);
    }

    @PatchMapping("/{taskId}/move")
    public TaskResponse move(
        @PathVariable UUID taskId,
        @Valid @RequestBody MoveTaskRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.move(taskId, request, currentUser);
    }

    @PatchMapping("/{taskId}/status")
    public TaskResponse updateStatus(
        @PathVariable UUID taskId,
        @Valid @RequestBody UpdateTaskStatusRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return taskService.updateStatus(taskId, request, currentUser);
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable UUID taskId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        taskService.delete(taskId, currentUser);
    }
}
