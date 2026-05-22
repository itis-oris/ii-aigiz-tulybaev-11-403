package com.sprintly.backend.service;

import com.sprintly.backend.dto.organization.CreateOrganizationRequest;
import com.sprintly.backend.dto.organization.OrganizationResponse;
import com.sprintly.backend.dto.organization.OrganizationSessionResponse;
import com.sprintly.backend.dto.organization.SwitchOrganizationRequest;
import com.sprintly.backend.dto.organization.UpdateOrganizationRequest;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.entity.enums.RoleName;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final OrganizationRoleService organizationRoleService;

    @Transactional(readOnly = true)
    public List<OrganizationResponse> findAllForCurrentUser(CustomUserDetails currentUser) {
        User user = getCurrentUser(currentUser.getId());
        UUID activeOrganizationId = getActiveOrganizationId(user);

        List<OrganizationResponse> responses = new ArrayList<>();
        for (Organization organization : getUserOrganizations(user)) {
            responses.add(toResponse(organization, activeOrganizationId));
        }

        return responses;
    }

    @Transactional
    public OrganizationSessionResponse create(CreateOrganizationRequest request, CustomUserDetails currentUser) {
        User user = getCurrentUser(currentUser.getId());

        Organization organization = organizationRepository.save(
            Organization.builder()
                .name(request.getName().trim())
                .ownerId(user.getId())
                .createdAt(OffsetDateTime.now())
                .build()
        );

        user.getOrganizations().add(organization);
        user.setOrganization(organization);
        userRepository.save(user);
        organizationRoleService.assignRole(user, organization, RoleName.ADMIN);

        return buildSessionResponse(user, organization);
    }

    @Transactional
    public OrganizationSessionResponse switchActiveOrganization(
        SwitchOrganizationRequest request,
        CustomUserDetails currentUser
    ) {
        User user = getCurrentUser(currentUser.getId());
        Organization organization = getOrganization(request.getOrganizationId());

        ensureOrganizationMember(user, organization);

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
        Organization organization = getOrganization(organizationId);
        ensureOrganizationMember(user, organization);
        ensureOrganizationOwner(user, organization, "Only organization owner can update organization");

        organization.setName(request.getName().trim());
        organizationRepository.save(organization);

        return toResponse(organization, getActiveOrganizationId(user));
    }

    @Transactional
    public OrganizationSessionResponse delete(UUID organizationId, CustomUserDetails currentUser) {
        User user = getCurrentUser(currentUser.getId());
        Organization organization = getOrganization(organizationId);

        Set<Organization> currentUserOrganizations = getUserOrganizations(user);
        ensureOrganizationMember(user, organization, currentUserOrganizations);
        ensureOrganizationOwner(user, organization, "Only organization owner can delete organization");

        if (currentUserOrganizations.size() <= 1) {
            throw new IllegalStateException("You cannot delete your last organization");
        }

        Organization fallbackOrganization = getFallbackOrganization(currentUserOrganizations, organization);

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
        return userRepository.findWithOrganizationsById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Organization getOrganization(UUID organizationId) {
        return organizationRepository.findByIdAndDeletedAtIsNull(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
    }

    private void ensureOrganizationMember(User user, Organization organization) {
        ensureOrganizationMember(user, organization, getUserOrganizations(user));
    }

    private void ensureOrganizationMember(
        User user,
        Organization organization,
        Set<Organization> userOrganizations
    ) {
        if (!hasOrganization(userOrganizations, organization.getId())) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }

    private void ensureOrganizationOwner(User user, Organization organization, String message) {
        if (organization.getOwnerId() == null || !organization.getOwnerId().equals(user.getId())) {
            throw new AccessDeniedException(message);
        }
    }

    private Set<Organization> getUserOrganizations(User user) {
        Set<Organization> organizations = new HashSet<>(user.getOrganizations());

        if (user.getOrganization() != null) {
            organizations.add(user.getOrganization());
        }

        Set<Organization> activeOrganizations = new HashSet<>();
        for (Organization organization : organizations) {
            if (organization.getDeletedAt() == null) {
                activeOrganizations.add(organization);
            }
        }

        return activeOrganizations;
    }

    private UUID getActiveOrganizationId(User user) {
        if (user.getOrganization() == null || user.getOrganization().getDeletedAt() != null) {
            return null;
        }

        return user.getOrganization().getId();
    }

    private Organization getFirstAvailableOrganization(User user, UUID excludedOrganizationId) {
        for (Organization organization : getUserOrganizations(user)) {
            if (!organization.getId().equals(excludedOrganizationId)) {
                return organization;
            }
        }

        return null;
    }

    private Organization getFallbackOrganization(Set<Organization> organizations, Organization deletedOrganization) {
        for (Organization organization : organizations) {
            if (!organization.getId().equals(deletedOrganization.getId())) {
                return organization;
            }
        }

        throw new IllegalStateException("Replacement organization not found");
    }

    private boolean hasOrganization(Set<Organization> organizations, UUID organizationId) {
        for (Organization organization : organizations) {
            if (organization.getId().equals(organizationId)) {
                return true;
            }
        }

        return false;
    }

    private OrganizationSessionResponse buildSessionResponse(User user, Organization organization) {
        CustomUserDetails userDetails = new CustomUserDetails(
            user.getId(),
            organization.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            organizationRoleService.getAuthoritiesInOrganization(user, organization.getId())
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
