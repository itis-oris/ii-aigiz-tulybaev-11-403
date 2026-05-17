import { apiClient } from './client';

export type ProjectFolderResponse = {
    id: string;
    name: string;
    organizationId: string | null;
    organizationName: string | null;
    ownerId: string | null;
    ownerEmail: string | null;
    ownerFirstname: string | null;
    ownerLastname: string | null;
    ownerMiddlename: string | null;
    ownerAvatarUrl: string | null;
    createdAt: string;
    deletedAt: string | null;
};

export type CreateProjectFolderRequest = {
    name: string;
    ownerId?: string;
};

export type UpdateProjectFolderRequest = {
    name: string;
    ownerId?: string;
};

export function getProjectFolders() {
    return apiClient<ProjectFolderResponse[]>('/api/project-folders');
}

export function createProjectFolder(payload: CreateProjectFolderRequest) {
    return apiClient<ProjectFolderResponse>('/api/project-folders', {
        method: 'POST',
        body: payload,
    });
}

export function updateProjectFolder(
    folderId: string,
    payload: UpdateProjectFolderRequest,
) {
    return apiClient<ProjectFolderResponse>(
        `/api/project-folders/${folderId}`,
        {
            method: 'PUT',
            body: payload,
        },
    );
}

export function deleteProjectFolder(folderId: string) {
    return apiClient<null>(`/api/project-folders/${folderId}`, {
        method: 'DELETE',
    });
}
