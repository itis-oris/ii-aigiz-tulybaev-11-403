import { apiClient } from './client';

export type TagResponse = {
    id: string;
    name: string;
    color: string;
    system: boolean;
    projectId: string | null;
    projectName: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
};

export type CreateTagRequest = {
    name: string;
    color: string;
    projectId: string;
};

export type UpdateTagRequest = {
    name: string;
    color: string;
};

export function getTags(filters: { projectId?: string; taskId?: string }) {
    const searchParams = new URLSearchParams();

    if (filters.projectId) {
        searchParams.set('projectId', filters.projectId);
    }

    if (filters.taskId) {
        searchParams.set('taskId', filters.taskId);
    }

    return apiClient<TagResponse[]>(`/api/tags?${searchParams.toString()}`);
}

export function getTag(tagId: string) {
    return apiClient<TagResponse>(`/api/tags/${tagId}`);
}

export function createTag(payload: CreateTagRequest) {
    return apiClient<TagResponse>('/api/tags', {
        method: 'POST',
        body: payload,
    });
}

export function updateTag(tagId: string, payload: UpdateTagRequest) {
    return apiClient<TagResponse>(`/api/tags/${tagId}`, {
        method: 'PUT',
        body: payload,
    });
}

export function deleteTag(tagId: string) {
    return apiClient<null>(`/api/tags/${tagId}`, {
        method: 'DELETE',
    });
}
