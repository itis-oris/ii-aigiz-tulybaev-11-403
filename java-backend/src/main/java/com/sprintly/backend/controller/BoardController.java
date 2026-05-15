package com.sprintly.backend.controller;

import com.sprintly.backend.dto.board.BoardResponse;
import com.sprintly.backend.dto.board.CreateBoardRequest;
import com.sprintly.backend.dto.board.UpdateBoardRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.BoardService;
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
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@Tag(name = "Boards", description = "Эндпоинты управления досками")
@SecurityRequirement(name = "bearerAuth")
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    @Operation(summary = "Получить доски проекта")
    public List<BoardResponse> findAllByProject(
        @RequestParam UUID projectId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardService.findAllByProject(projectId, currentUser);
    }

    @GetMapping("/{boardId}")
    @Operation(summary = "Получить доску по id")
    public BoardResponse findById(
        @PathVariable UUID boardId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardService.findById(boardId, currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать доску")
    public BoardResponse create(
        @Valid @RequestBody CreateBoardRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardService.create(request, currentUser);
    }

    @PutMapping("/{boardId}")
    @Operation(summary = "Обновить доску")
    public BoardResponse update(
        @PathVariable UUID boardId,
        @Valid @RequestBody UpdateBoardRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return boardService.update(boardId, request, currentUser);
    }

    @DeleteMapping("/{boardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Мягко удалить доску")
    public void delete(
        @PathVariable UUID boardId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        boardService.delete(boardId, currentUser);
    }
}
