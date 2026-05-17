package com.sprintly.backend.service;

import com.sprintly.backend.dto.organization.CreateOrganizationRequest;
import com.sprintly.backend.dto.organization.OrganizationResponse;
import com.sprintly.backend.dto.organization.OrganizationSessionResponse;
import com.sprintly.backend.dto.organization.SwitchOrganizationRequest;
import com.sprintly.backend.dto.organization.UpdateOrganizationRequest;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.Role;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.RoleName;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.RoleRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public List<OrganizationResponse> findAllForCurrentUser(CustomUserDetails currentUser) {
        User user = getCurrentUser(currentUser.getId());
        UUID activeOrganizationId = getActiveOrganizationId(user);

        return getOrganizationsWithLegacyMembership(user).stream()
            .map(organization -> toResponse(organization, activeOrganizationId))
            .toList();
    }

    @Transactional
    public OrganizationSessionResponse create(CreateOrganizationRequest request, CustomUserDetails currentUser) {
        User user = getCurrentUser(currentUser.getId());
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
            .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMIN).build()));

        Organization organization = organizationRepository.save(
            Organization.builder()
                .name(request.getName().trim())
                .ownerId(user.getId())
                .createdAt(OffsetDateTime.now())
                .build()
        );

        user.getOrganizations().add(organization);
        user.setOrganization(organization);
        user.getRoles().add(adminRole);
        userRepository.save(user);

        return buildSessionResponse(user, organization);
    }

    @Transactional
    public OrganizationSessionResponse switchActiveOrganization(
        SwitchOrganizationRequest request,
        CustomUserDetails currentUser
    ) {
        User user = getCurrentUser(currentUser.getId());
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(request.getOrganizationId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (getOrganizationsWithLegacyMembership(user).stream().noneMatch(item -> item.getId().equals(organization.getId()))) {
            throw new AccessDeniedException("User is not a member of this organization");
        }

        user.setOrganization(organization);
        userRepository.save(user);

        return buildSessionResponse(user, organization);
    }

    @Transactional
    public OrganizationResponse update(
        UUID organizationId,
        UpdateOrganizationRequest request,
        CustomUserDetails currentUser
    ) {
        User user = getCurrentUser(currentUser.getId());
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (getOrganizationsWithLegacyMembership(user).stream().noneMatch(item -> item.getId().equals(organization.getId()))) {
            throw new AccessDeniedException("User is not a member of this organization");
        }

        if (organization.getOwnerId() == null || !organization.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException("Only organization owner can update organization");
        }

        organization.setName(request.getName().trim());
        organizationRepository.save(organization);

        return toResponse(organization, getActiveOrganizationId(user));
    }

    @Transactional
    public OrganizationSessionResponse delete(UUID organizationId, CustomUserDetails currentUser) {
        User user = getCurrentUser(currentUser.getId());
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Set<Organization> currentUserOrganizations = getOrganizationsWithLegacyMembership(user);

        if (currentUserOrganizations.stream().noneMatch(item -> item.getId().equals(organization.getId()))) {
            throw new AccessDeniedException("User is not a member of this organization");
        }

        if (organization.getOwnerId() == null || !organization.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException("Only organization owner can delete organization");
        }

        if (currentUserOrganizations.size() <= 1) {
            throw new IllegalStateException("You cannot delete your last organization");
        }

        Organization fallbackOrganization = currentUserOrganizations.stream()
            .filter(item -> !item.getId().equals(organization.getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Replacement organization not found"));

        Set<User> impactedUsers = new HashSet<>(organization.getMembers());
        impactedUsers.addAll(organization.getUsers());

        for (User impactedUser : impactedUsers) {
            if (
                impactedUser.getOrganization() != null &&
                impactedUser.getOrganization().getId().equals(organization.getId())
            ) {
                impactedUser.setOrganization(
                    getFirstAvailableOrganization(impactedUser, organization.getId())
                );
            }
        }

        user.setOrganization(fallbackOrganization);

        organization.setDeletedAt(OffsetDateTime.now());
        organizationRepository.save(organization);

        return buildSessionResponse(user, fallbackOrganization);
    }

    private User getCurrentUser(UUID userId) {
        return userRepository.findWithRolesById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Set<Organization> getOrganizationsWithLegacyMembership(User user) {
        Set<Organization> organizations = new HashSet<>(user.getOrganizations());

        if (user.getOrganization() != null) {
            organizations.add(user.getOrganization());
        }

        return organizations.stream()
            .filter(organization -> organization.getDeletedAt() == null)
            .collect(Collectors.toSet());
    }

    private UUID getActiveOrganizationId(User user) {
        return getActiveOrganization(user)
            .map(Organization::getId)
            .orElse(null);
    }

    private Organization getFirstAvailableOrganization(User user, UUID excludedOrganizationId) {
        return getOrganizationsWithLegacyMembership(user).stream()
            .filter(organization -> !organization.getId().equals(excludedOrganizationId))
            .findFirst()
            .orElse(null);
    }

    private java.util.Optional<Organization> getActiveOrganization(User user) {
        if (user.getOrganization() == null || user.getOrganization().getDeletedAt() != null) {
            return java.util.Optional.empty();
        }

        return java.util.Optional.of(user.getOrganization());
    }

    private OrganizationSessionResponse buildSessionResponse(User user, Organization organization) {
        CustomUserDetails userDetails = new CustomUserDetails(
            user.getId(),
            organization.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toSet())
        );

        return OrganizationSessionResponse.builder()
            .organization(toResponse(organization, organization.getId()))
            .accessToken(jwtService.generateAccessToken(userDetails))
            .build();
    }

    private OrganizationResponse toResponse(Organization organization, UUID activeOrganizationId) {
        return OrganizationResponse.builder()
            .id(organization.getId())
            .name(organization.getName())
            .ownerId(organization.getOwnerId())
            .createdAt(organization.getCreatedAt())
            .active(organization.getId().equals(activeOrganizationId))
            .build();
    }
}
