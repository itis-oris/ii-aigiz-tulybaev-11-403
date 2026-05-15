package com.sprintly.backend.controller;

import com.sprintly.backend.dto.auth.AuthResponse;
import com.sprintly.backend.dto.auth.CurrentUserResponse;
import com.sprintly.backend.dto.auth.LoginRequest;
import com.sprintly.backend.dto.auth.RegisterRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and user session endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Creates organization and first admin user")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user and returns JWT access token")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns current authenticated user")
    public CurrentUserResponse me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return authService.me(userDetails);
    }
}
