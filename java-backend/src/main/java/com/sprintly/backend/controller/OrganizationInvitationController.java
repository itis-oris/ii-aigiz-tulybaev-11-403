package com.sprintly.backend.controller;

import com.sprintly.backend.dto.organization.OrganizationInvitationDetailsResponse;
import com.sprintly.backend.dto.organization.OrganizationSessionResponse;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.OrganizationInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
@Tag(name = "Organization Invitations", description = "Organization invitation endpoints")
public class OrganizationInvitationController {

    private final OrganizationInvitationService organizationInvitationService;

    @GetMapping("/{token}")
    @Operation(summary = "Get invitation details")
    public OrganizationInvitationDetailsResponse getInvitationDetails(
        @PathVariable("token") com.sprintly.backend.entity.OrganizationInvitation invitation
    ) {
        return organizationInvitationService.getInvitationDetails(invitation);
    }

    @PostMapping("/{token}/accept")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Accept invitation")
    public OrganizationSessionResponse acceptInvitation(
        @PathVariable("token") com.sprintly.backend.entity.OrganizationInvitation invitation,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return organizationInvitationService.acceptInvitation(invitation, currentUser);
    }
}
