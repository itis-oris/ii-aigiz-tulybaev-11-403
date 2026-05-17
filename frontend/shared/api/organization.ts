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
