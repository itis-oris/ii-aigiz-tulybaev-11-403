package com.sprintly.backend.controller;

import com.sprintly.backend.dto.column.ColumnResponse;
import com.sprintly.backend.dto.column.CreateColumnRequest;
import com.sprintly.backend.dto.column.UpdateColumnRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.BoardColumnService;
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
@RequestMapping("/api/columns")
@RequiredArgsConstructor
@Tag(name = "Columns", description = "Эндпоинты управления колонками")
@SecurityRequirement(name = "bearerAuth")
public class BoardColumnController {

    private final BoardColumnService boardColumnService;

    @GetMapping
    @Operation(summary = "Получить колонки доски")
    public List<ColumnResponse> findAllByBoard(
        @RequestParam UUID boardId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardColumnService.findAllByBoard(boardId, currentUser);
    }

    @GetMapping("/{columnId}")
    @Operation(summary = "Получить колонку по id")
    public ColumnResponse findById(
        @PathVariable UUID columnId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardColumnService.findById(columnId, currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать колонку")
    public ColumnResponse create(
        @Valid @RequestBody CreateColumnRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardColumnService.create(request, currentUser);
    }

    @PutMapping("/{columnId}")
    @Operation(summary = "Обновить колонку")
    public ColumnResponse update(
        @PathVariable UUID columnId,
        @Valid @RequestBody UpdateColumnRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardColumnService.update(columnId, request, currentUser);
    }

    @DeleteMapping("/{columnId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Мягко удалить колонку")
    public void delete(
        @PathVariable UUID columnId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        boardColumnService.delete(columnId, currentUser);
    }
}
