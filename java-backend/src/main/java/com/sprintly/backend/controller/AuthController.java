package com.sprintly.backend.controller;

import com.sprintly.backend.dto.auth.AuthResponse;
import com.sprintly.backend.dto.auth.CurrentUserResponse;
import com.sprintly.backend.dto.auth.LoginRequest;
import com.sprintly.backend.dto.auth.RegisterRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.AuthService;
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
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return authService.me(userDetails);
    }
}
