import { apiClient } from './client';
import type { UserResponse } from './user';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export type ProjectResponse = {
    id: string;
    name: string;
    description: string | null;
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
    folderId: string | null;
    createdAt: string;
    deletedAt: string | null;
};

export type CreateProjectRequest = {
    name: string;
    description?: string;
    status?: ProjectStatus;
    ownerId?: string;
    folderId?: string;
};

export type UpdateProjectRequest = {
    name: string;
    description?: string;
    status?: ProjectStatus;
    ownerId?: string;
    folderId?: string;
};

export type AddProjectMembersRequest = {
    userIds: string[];
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

export function uploadProjectImage(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient<ProjectResponse>(`/api/projects/${projectId}/image`, {
        method: 'POST',
        body: formData,
    });
}

export function getProjectMembers(projectId: string) {
    return apiClient<UserResponse[]>(`/api/projects/${projectId}/members`);
}

export function addProjectMembers(
    projectId: string,
    payload: AddProjectMembersRequest,
) {
    return apiClient<UserResponse[]>(`/api/projects/${projectId}/members`, {
        method: 'POST',
        body: payload,
    });
}
