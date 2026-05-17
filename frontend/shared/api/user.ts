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
