package com.sprintly.backend.controller;

import com.sprintly.backend.dto.user.UserResponse;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Эндпоинты пользователей организации")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Получить пользователей текущей организации")
    public List<UserResponse> findAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return userService.findAllInCurrentOrganization(currentUser);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Получить пользователя по id")
    public UserResponse findById(
        @PathVariable UUID userId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return userService.findById(userId, currentUser);
    }
}
