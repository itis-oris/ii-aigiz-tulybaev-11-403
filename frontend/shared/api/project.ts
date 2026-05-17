import { apiClient } from './client';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export type ProjectResponse = {
    id: string;
    name: string;
    imageUrl: string | null;
    organizationId: string | null;
    organizationName: string | null;
    status: ProjectStatus;
    ownerId: string | null;
    ownerEmail: string | null;
    ownerFirstname: string | null;
    ownerLastname: string | null;
    ownerMiddlename: string | null;
    ownerAvatarUrl: string | null;
    createdAt: string;
    deletedAt: string | null;
};

export type CreateProjectRequest = {
    name: string;
    status?: ProjectStatus;
    ownerId?: string;
};

export type UpdateProjectRequest = {
    name: string;
    status?: ProjectStatus;
    ownerId?: string;
};

export function getProjects() {
    return apiClient<ProjectResponse[]>('/api/projects');
}

export function createProject(payload: CreateProjectRequest) {
    return apiClient<ProjectResponse>('/api/projects', {
        method: 'POST',
        body: payload,
    });
}

export function updateProject(
    projectId: string,
    payload: UpdateProjectRequest,
) {
    return apiClient<ProjectResponse>(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: payload,
    });
}

export function deleteProject(projectId: string) {
    return apiClient<null>(`/api/projects/${projectId}`, {
        method: 'DELETE',
    });
}
