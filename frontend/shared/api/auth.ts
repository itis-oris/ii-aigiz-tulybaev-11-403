import type { OrganizationResponse } from './organization';
import { apiClient } from './client';

export type LoginRequest = {
    email: string;
    password: string;
    captchaToken: string;
};

export type RegisterRequest = {
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    password: string;
    captchaToken: string;
};

export type AuthResponse = {
    userId: string;
    organizationId: string | null;
    email: string;
    roles: string[];
    accessToken: string;
};

export type CurrentUserResponse = {
    userId: string;
    organizationId: string | null;
    organizationName: string | null;
    organizations: OrganizationResponse[];
    email: string;
    firstname: string;
    lastname: string;
    middlename: string | null;
    avatarUrl: string | null;
    roles: string[];
};

export function login(payload: LoginRequest) {
    return apiClient<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: payload,
    });
}

export function register(payload: RegisterRequest) {
    return apiClient<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: payload,
    });
}

export function getCurrentUser() {
    return apiClient<CurrentUserResponse>('/api/auth/me');
}
