'use client';

import { useAuth } from './auth/index';

export function useCurrentUser() {
    const { isLoading, user } = useAuth();

    return {
        data: user,
        isLoading,
        isError: false,
    };
}
