'use client';

import { useAuth } from './auth-provider';

export function useCurrentUser() {
    const { isLoading, user } = useAuth();

    return {
        data: user,
        isLoading,
        isError: false,
    };
}
