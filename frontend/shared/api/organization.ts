import { apiClient } from './client';

export type OrganizationResponse = {
    id: string;
    name: string;
    ownerId: string | null;
    createdAt: string;
    active: boolean;
};

export type OrganizationSessionResponse = {
    organization: OrganizationResponse;
    accessToken: string;
};

export type CreateOrganizationRequest = {
    name: string;
};

export type UpdateOrganizationRequest = {
    name: string;
};

export type CreateOrganizationInvitationsRequest = {
    createLinkInvitation: boolean;
    emails: string[];
};

export type OrganizationInvitationResponse = {
    id: string;
    organizationId: string;
    organizationName: string;
    email: string | null;
    token: string;
    createdAt: string;
    expiresAt: string;
    acceptedAt: string | null;
    revokedAt: string | null;
};

export type OrganizationInvitationDetailsResponse = {
    organizationId: string;
    organizationName: string;
    email: string | null;
    expiresAt: string;
    expired: boolean;
    accepted: boolean;
    revoked: boolean;
};

export function getOrganizations() {
    return apiClient<OrganizationResponse[]>('/api/organizations');
}

export function createOrganization(payload: CreateOrganizationRequest) {
    return apiClient<OrganizationSessionResponse>('/api/organizations', {
        method: 'POST',
        body: payload,
    });
}

export function switchOrganization(organizationId: string) {
    return apiClient<OrganizationSessionResponse>('/api/organizations/switch', {
        method: 'POST',
        body: { organizationId },
    });
}

export function updateOrganization(
    organizationId: string,
    payload: UpdateOrganizationRequest,
) {
    return apiClient<OrganizationResponse>(
        `/api/organizations/${organizationId}`,
        {
            method: 'PUT',
            body: payload,
        },
    );
}

export function deleteOrganization(organizationId: string) {
    return apiClient<OrganizationSessionResponse>(
        `/api/organizations/${organizationId}`,
        {
            method: 'DELETE',
        },
    );
}

export function createOrganizationInvitations(
    organizationId: string,
    payload: CreateOrganizationInvitationsRequest,
) {
    return apiClient<OrganizationInvitationResponse[]>(
        `/api/organizations/${organizationId}/invitations`,
        {
            method: 'POST',
            body: payload,
        },
    );
}

export function getOrganizationInvitation(token: string) {
    return apiClient<OrganizationInvitationDetailsResponse>(
        `/api/invitations/${token}`,
    );
}

export function acceptOrganizationInvitation(token: string) {
    return apiClient<OrganizationSessionResponse>(
        `/api/invitations/${token}/accept`,
        {
            method: 'POST',
        },
    );
}
