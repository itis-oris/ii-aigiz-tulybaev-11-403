package com.sprintly.backend.service;

import com.sprintly.backend.dto.organization.CreateOrganizationInvitationsRequest;
import com.sprintly.backend.dto.organization.OrganizationInvitationDetailsResponse;
import com.sprintly.backend.dto.organization.OrganizationInvitationResponse;
import com.sprintly.backend.dto.organization.OrganizationResponse;
import com.sprintly.backend.dto.organization.OrganizationSessionResponse;
import com.sprintly.backend.entity.Organization;
import com.sprintly.backend.entity.OrganizationInvitation;
import com.sprintly.backend.entity.User;
import com.sprintly.backend.exception.AccessDeniedException;
import com.sprintly.backend.exception.ResourceNotFoundException;
import com.sprintly.backend.repository.OrganizationInvitationRepository;
import com.sprintly.backend.repository.OrganizationRepository;
import com.sprintly.backend.repository.UserRepository;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationInvitationService {

    private static final int INVITATION_TTL_DAYS = 7;

    private final OrganizationInvitationRepository organizationInvitationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final OrganizationRoleService organizationRoleService;
    private final ProjectAccessService projectAccessService;

    @Transactional
    public List<OrganizationInvitationResponse> createInvitations(
        UUID organizationId,
        CreateOrganizationInvitationsRequest request,
        CustomUserDetails currentUser
    ) {
        Organization organization = organizationRepository.findByIdAndDeletedAtIsNull(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        projectAccessService.ensureOrgAdmin(currentUser, organization, "Insufficient permissions for invitations");
        User invitedByUser = userRepository.findWithOrganizationsById(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ensureOrganizationMembership(invitedByUser, organizationId);

        List<OrganizationInvitation> invitations = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = now.plusDays(INVITATION_TTL_DAYS);

        if (request.isCreateLinkInvitation()) {
            invitations.add(buildInvitation(organization, invitedByUser, null, now, expiresAt));
        }

        for (String email : request.getEmails() == null ? List.<String>of() : request.getEmails()) {
            String normalizedEmail = normalizeEmail(email);
            if (normalizedEmail == null) {
                continue;
            }

            invitations.add(buildInvitation(organization, invitedByUser, normalizedEmail, now, expiresAt));
        }

        if (invitations.isEmpty()) {
            throw new IllegalArgumentException("At least one invite link or email is required");
        }

        List<OrganizationInvitationResponse> responses = new ArrayList<>();
        for (OrganizationInvitation invitation : organizationInvitationRepository.saveAll(invitations)) {
            responses.add(toResponse(invitation));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public OrganizationInvitationDetailsResponse getInvitationDetails(OrganizationInvitation invitation) {
        return OrganizationInvitationDetailsResponse.builder()
            .organizationId(invitation.getOrganization().getId())
            .organizationName(invitation.getOrganization().getName())
            .email(invitation.getEmail())
            .expiresAt(invitation.getExpiresAt())
            .expired(isExpired(invitation))
            .accepted(invitation.getAcceptedAt() != null)
            .revoked(invitation.getRevokedAt() != null)
            .build();
    }

    @Transactional
    public OrganizationSessionResponse acceptInvitation(
        OrganizationInvitation invitation,
        CustomUserDetails currentUser
    ) {
        User user = userRepository.findWithOrganizationsById(currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        OrganizationInvitation activeInvitation = requireActiveInvitation(invitation);

        ensureInvitationAcceptable(activeInvitation, user);
        validateInvitationEmail(activeInvitation, user.getEmail());

        user.getOrganizations().add(activeInvitation.getOrganization());
        user.setOrganization(activeInvitation.getOrganization());
        userRepository.save(user);

        if (activeInvitation.getAcceptedAt() == null) {
            activeInvitation.setAcceptedAt(OffsetDateTime.now());
            activeInvitation.setAcceptedByUser(user);
            organizationInvitationRepository.save(activeInvitation);
        }

        return buildSessionResponse(user, activeInvitation.getOrganization());
    }

    @Transactional(readOnly = true)
    public OrganizationInvitation requireInvitationForRegistration(String token, String email) {
        OrganizationInvitation invitation = requireActiveInvitation(getInvitation(token));
        if (invitation.getAcceptedAt() != null) {
            throw new IllegalStateException("Invitation has already been accepted");
        }
        validateInvitationEmail(invitation, email);
        return invitation;
    }

    @Transactional
    public void markInvitationAccepted(OrganizationInvitation invitation, User user) {
        if (invitation.getAcceptedAt() != null) {
            return;
        }

        invitation.setAcceptedAt(OffsetDateTime.now());
        invitation.setAcceptedByUser(user);
        organizationInvitationRepository.save(invitation);
    }

    private OrganizationInvitation buildInvitation(
        Organization organization,
        User invitedByUser,
        String email,
        OffsetDateTime createdAt,
        OffsetDateTime expiresAt
    ) {
        return OrganizationInvitation.builder()
            .id(UUID.randomUUID())
            .organization(organization)
            .invitedByUser(invitedByUser)
            .email(email)
            .token(UUID.randomUUID().toString())
            .createdAt(createdAt)
            .expiresAt(expiresAt)
            .build();
    }

    private OrganizationInvitationResponse toResponse(OrganizationInvitation invitation) {
        return OrganizationInvitationResponse.builder()
            .id(invitation.getId())
            .organizationId(invitation.getOrganization().getId())
            .organizationName(invitation.getOrganization().getName())
            .email(invitation.getEmail())
            .token(invitation.getToken())
            .createdAt(invitation.getCreatedAt())
            .expiresAt(invitation.getExpiresAt())
            .acceptedAt(invitation.getAcceptedAt())
            .revokedAt(invitation.getRevokedAt())
            .build();
    }

    private OrganizationInvitation getInvitation(String token) {
        return organizationInvitationRepository.findByToken(token)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
    }

    private OrganizationInvitation requireActiveInvitation(OrganizationInvitation invitation) {
        if (invitation.getRevokedAt() != null) {
            throw new IllegalStateException("Invitation has been revoked");
        }
        if (isExpired(invitation)) {
            throw new IllegalStateException("Invitation has expired");
        }

        return invitation;
    }

    private boolean isExpired(OrganizationInvitation invitation) {
        return invitation.getExpiresAt().isBefore(OffsetDateTime.now());
    }

    private void validateInvitationEmail(OrganizationInvitation invitation, String email) {
        String invitationEmail = invitation.getEmail();
        if (invitationEmail == null || invitationEmail.isBlank()) {
            return;
        }

        if (!invitationEmail.equalsIgnoreCase(email.trim().toLowerCase())) {
            throw new AccessDeniedException("Invitation email does not match current user");
        }
    }

    private void ensureInvitationAcceptable(OrganizationInvitation invitation, User user) {
        if (invitation.getAcceptedAt() == null) {
            return;
        }

        if (
            invitation.getAcceptedByUser() != null
                && invitation.getAcceptedByUser().getId().equals(user.getId())
        ) {
            return;
        }

        throw new IllegalStateException("Invitation has already been accepted");
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }

        String normalized = email.trim().toLowerCase();
        return normalized.isEmpty() ? null : normalized;
    }

    private void ensureOrganizationMembership(User user, UUID organizationId) {
        boolean isMember = false;
        for (Organization organization : user.getOrganizations()) {
            if (organizationId.equals(organization.getId())) {
                isMember = true;
                break;
            }
        }

        if (!isMember && (user.getOrganization() == null || !organizationId.equals(user.getOrganization().getId()))) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
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
            .organization(OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .ownerId(organization.getOwnerId())
                .createdAt(organization.getCreatedAt())
                .active(true)
                .build())
            .accessToken(jwtService.generateAccessToken(userDetails))
            .build();
    }
}
