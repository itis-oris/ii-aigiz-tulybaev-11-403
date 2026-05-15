package com.sprintly.backend.service;

import com.sprintly.backend.dto.auth.AuthResponse;
import com.sprintly.backend.dto.auth.CurrentUserResponse;
import com.sprintly.backend.dto.auth.LoginRequest;
import com.sprintly.backend.dto.auth.RegisterRequest;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.Role;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.RoleName;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.RoleRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CaptchaVerificationService captchaVerificationService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        captchaVerificationService.verify(request.getCaptchaToken());

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
            .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMIN).build()));

        Organization organization = organizationRepository.save(
            Organization.builder()
                .name(request.getOrganizationName().trim())
                .createdAt(OffsetDateTime.now())
                .build()
        );

        User user = userRepository.save(
            User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .middlename(request.getMiddlename())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(organization)
                .roles(Set.of(adminRole))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build()
        );

        organization.setOwnerId(user.getId());

        CustomUserDetails userDetails = new CustomUserDetails(
            user.getId(),
            organization.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getRoles().stream()
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toSet())
        );

        return AuthResponse.builder()
            .userId(user.getId())
            .organizationId(organization.getId())
            .email(user.getEmail())
            .roles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()))
            .accessToken(jwtService.generateAccessToken(userDetails))
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        captchaVerificationService.verify(request.getCaptchaToken());

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().trim().toLowerCase(),
                request.getPassword()
            )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return AuthResponse.builder()
            .userId(userDetails.getId())
            .organizationId(userDetails.getOrganizationId())
            .email(userDetails.getEmail())
            .roles(userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toSet()))
            .accessToken(jwtService.generateAccessToken(userDetails))
            .build();
    }

    public CurrentUserResponse me(CustomUserDetails userDetails) {
        User user = userRepository.findWithRolesById(userDetails.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return CurrentUserResponse.builder()
            .userId(user.getId())
            .organizationId(user.getOrganization().getId())
            .email(user.getEmail())
            .firstname(user.getFirstname())
            .lastname(user.getLastname())
            .middlename(user.getMiddlename())
            .avatarUrl(user.getAvatarUrl())
            .roles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()))
            .build();
    }
}
