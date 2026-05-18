package com.sprintly.backend.controller;

import com.sprintly.backend.dto.organization.CreateOrganizationRequest;
import com.sprintly.backend.dto.organization.CreateOrganizationInvitationsRequest;
import com.sprintly.backend.dto.organization.OrganizationInvitationResponse;
import com.sprintly.backend.dto.organization.OrganizationResponse;
import com.sprintly.backend.dto.organization.OrganizationSessionResponse;
import com.sprintly.backend.dto.organization.SwitchOrganizationRequest;
import com.sprintly.backend.dto.organization.UpdateOrganizationRequest;
import com.sprintly.backend.security.CustomUserDetails;
import com.sprintly.backend.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizations", description = "Organization membership and switching endpoints")
@SecurityRequirement(name = "bearerAuth")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final com.sprintly.backend.service.OrganizationInvitationService organizationInvitationService;

    @GetMapping
    @Operation(summary = "List my organizations")
    public List<OrganizationResponse> findAll(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return organizationService.findAllForCurrentUser(currentUser);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create organization and make it active")
    public OrganizationSessionResponse create(
        @Valid @RequestBody CreateOrganizationRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return organizationService.create(request, currentUser);
    }

    @PostMapping("/switch")
    @Operation(summary = "Switch active organization")
    public OrganizationSessionResponse switchOrganization(
        @Valid @RequestBody SwitchOrganizationRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return organizationService.switchActiveOrganization(request, currentUser);
    }

    @PutMapping("/{organizationId}")
    @Operation(summary = "Update organization")
    public OrganizationResponse update(
        @PathVariable UUID organizationId,
        @Valid @RequestBody UpdateOrganizationRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return organizationService.update(organizationId, request, currentUser);
    }

    @DeleteMapping("/{organizationId}")
    @Operation(summary = "Delete organization")
    public OrganizationSessionResponse delete(
        @PathVariable UUID organizationId,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return organizationService.delete(organizationId, currentUser);
    }

    @PostMapping("/{organizationId}/invitations")
    @Operation(summary = "Create organization invitations")
    public List<OrganizationInvitationResponse> createInvitations(
        @PathVariable UUID organizationId,
        @Valid @RequestBody CreateOrganizationInvitationsRequest request,
        @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return organizationInvitationService.createInvitations(
            organizationId,
            request,
            currentUser
        );
    }
}
