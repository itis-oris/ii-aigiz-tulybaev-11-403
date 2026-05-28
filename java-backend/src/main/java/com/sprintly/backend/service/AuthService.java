package com.sprintly.backend.service;

import com.sprintly.backend.dto.auth.AuthResponse;
import com.sprintly.backend.dto.auth.CurrentUserResponse;
import com.sprintly.backend.dto.auth.LoginRequest;
import com.sprintly.backend.dto.auth.RegisterRequest;
import com.sprintly.backend.dto.organization.OrganizationResponse;
import com.sprintly.backend.entity.OrganizationInvitation;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.exception.UnauthorizedException;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CaptchaVerificationService captchaVerificationService;
    private final OrganizationInvitationService organizationInvitationService;
    private final OrganizationRoleService organizationRoleService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        captchaVerificationService.verify(request.getCaptchaToken());

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        String invitationToken = normalizeInvitationToken(request.getInvitationToken());
        OrganizationInvitation invitation = invitationToken != null
            ? organizationInvitationService.requireInvitationForRegistration(
                invitationToken,
                normalizedEmail
            )
            : null;

        User user = userRepository.save(
            User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .middlename(request.getMiddlename())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .organization(invitation != null ? invitation.getOrganization() : null)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build()
        );

        Organization organization;
        if (invitation != null) {
            organization = invitation.getOrganization();
            user.getOrganizations().add(organization);
            user = userRepository.save(user);
            organizationInvitationService.markInvitationAccepted(invitation, user);
        } else {
            organization = organizationRepository.save(
                Organization.builder()
                    .name(buildInitialOrganizationName(user))
                    .ownerId(user.getId())
                    .createdAt(OffsetDateTime.now())
                    .build()
            );

            user.setOrganization(organization);
            user.getOrganizations().add(organization);
            user = userRepository.save(user);
        }

        Set<SimpleGrantedAuthority> authorities =
            organizationRoleService.getAuthoritiesInOrganization(user, organization.getId());
        Set<String> roleNames = extractRoleNames(authorities);

        CustomUserDetails userDetails = new CustomUserDetails(
            user.getId(),
            organization.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            authorities
        );

        return AuthResponse.builder()
            .userId(user.getId())
            .organizationId(organization.getId())
            .email(user.getEmail())
            .roles(roleNames)
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
            .roles(extractRoleNames(userDetails.getAuthorities()))
            .accessToken(jwtService.generateAccessToken(userDetails))
            .build();
    }

    public CurrentUserResponse me(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Not authenticated");
        }

        User user = userRepository.findWithOrganizationsById(userDetails.getId())
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
            .roles(
                activeOrganization != null
                    ? organizationRoleService.getRoleNamesInOrganization(
                        user,
                        activeOrganization.getId()
                    )
                    : Set.of()
            )
            .build();
    }

    private List<OrganizationResponse> mapOrganizations(User user) {
        Set<Organization> organizations = new HashSet<>(user.getOrganizations());
        Organization activeOrganization = getActiveOrganization(user);

        if (activeOrganization != null) {
            organizations.add(activeOrganization);
        }

        List<OrganizationResponse> responses = new ArrayList<>();
        for (Organization organization : organizations) {
            if (organization.getDeletedAt() != null) {
                continue;
            }

            responses.add(OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .ownerId(organization.getOwnerId())
                .createdAt(organization.getCreatedAt())
                .active(
                    activeOrganization != null
                        && organization.getId().equals(activeOrganization.getId())
                )
                .build());
        }

        return responses;
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

    private String normalizeInvitationToken(String invitationToken) {
        if (invitationToken == null) {
            return null;
        }

        String normalized = invitationToken.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private Set<String> extractRoleNames(Collection<? extends GrantedAuthority> authorities) {
        Set<String> roleNames = new HashSet<>();
        for (GrantedAuthority authority : authorities) {
            roleNames.add(authority.getAuthority().replace("ROLE_", ""));
        }

        return roleNames;
    }
}
