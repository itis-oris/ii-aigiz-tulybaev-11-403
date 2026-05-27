import type { CurrentUserResponse } from './auth';
import { apiClient } from './client';

export type UserResponse = {
    id: string;
    firstname: string | null;
    lastname: string | null;
    middlename: string | null;
    email: string;
    avatarUrl: string | null;
    organizationId: string | null;
    organizationName: string | null;
    roles: string[];
    createdAt: string;
    updatedAt: string | null;
};

export function getUsers() {
    return apiClient<UserResponse[]>('/api/users');
}

export type UpdateCurrentUserRequest = {
    firstname: string;
    lastname: string;
    middlename: string;
};

export function updateCurrentUser(payload: UpdateCurrentUserRequest) {
    return apiClient<CurrentUserResponse>('/api/users/me', {
        method: 'PUT',
        body: payload,
    });
}

export function uploadCurrentUserAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient<UserResponse>('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
    });
}
