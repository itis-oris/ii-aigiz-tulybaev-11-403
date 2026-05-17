package com.sprintly.backend.service;

import com.sprintly.backend.dto.auth.AuthResponse;
import com.sprintly.backend.dto.auth.CurrentUserResponse;
import com.sprintly.backend.dto.auth.LoginRequest;
import com.sprintly.backend.dto.auth.RegisterRequest;
import com.sprintly.backend.dto.organization.OrganizationResponse;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
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

        User user = userRepository.save(
            User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .middlename(request.getMiddlename())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(null)
                .roles(Set.of(adminRole))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build()
        );

        Organization organization = organizationRepository.save(
            Organization.builder()
                .name(buildInitialOrganizationName(user))
                .ownerId(user.getId())
                .createdAt(OffsetDateTime.now())
                .build()
        );

        user.setOrganization(organization);
        user.getOrganizations().add(organization);
        user = userRepository.save(user);

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
        Organization activeOrganization = getActiveOrganization(user);

        return CurrentUserResponse.builder()
            .userId(user.getId())
            .organizationId(activeOrganization != null ? activeOrganization.getId() : null)
            .email(user.getEmail())
            .firstname(user.getFirstname())
            .lastname(user.getLastname())
            .middlename(user.getMiddlename())
            .avatarUrl(user.getAvatarUrl())
            .organizationName(activeOrganization != null ? activeOrganization.getName() : null)
            .organizations(mapOrganizations(user))
            .roles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()))
            .build();
    }

    private List<OrganizationResponse> mapOrganizations(User user) {
        Set<Organization> organizations = new HashSet<>(user.getOrganizations());
        Organization activeOrganization = getActiveOrganization(user);

        if (activeOrganization != null) {
            organizations.add(activeOrganization);
        }

        return organizations.stream()
            .filter(organization -> organization.getDeletedAt() == null)
            .map(organization -> OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .ownerId(organization.getOwnerId())
                .createdAt(organization.getCreatedAt())
                .active(
                    activeOrganization != null
                        && organization.getId().equals(activeOrganization.getId())
                )
                .build())
            .toList();
    }

    private Organization getActiveOrganization(User user) {
        if (user.getOrganization() == null || user.getOrganization().getDeletedAt() != null) {
            return null;
        }

        return user.getOrganization();
    }

    private String buildInitialOrganizationName(User user) {
        String baseName = user.getFirstname() != null && !user.getFirstname().isBlank()
            ? user.getFirstname().trim()
            : user.getEmail().split("@")[0];

        String shortId = user.getId().toString().substring(0, 8);
        return "Organization " + baseName + " " + shortId;
    }
}
