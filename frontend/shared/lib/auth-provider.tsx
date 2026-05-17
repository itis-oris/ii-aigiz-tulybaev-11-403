'use client';

import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ApiError,
    getCurrentUser,
    type CurrentUserResponse,
} from '@/shared/api';
import { clearAccessToken, getAccessToken, setAccessToken } from './auth';

type AuthContextValue = {
    token: string | null;
    user: CurrentUserResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasActiveOrganization: boolean;
    setToken: (token: string) => void;
    applyToken: (token: string) => Promise<CurrentUserResponse>;
    logout: () => void;
    refetchUser: () => Promise<CurrentUserResponse | undefined>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
    const queryClient = useQueryClient();
    const [token, setTokenState] = useState<string | null>(() =>
        getAccessToken(),
    );
    const currentUserQuery = useQuery({
        queryKey: ['current-user'],
        queryFn: getCurrentUser,
        enabled: Boolean(token),
        retry: false,
    });
    const currentUser = currentUserQuery.data ?? null;
    const currentUserError = currentUserQuery.error;
    const currentUserLoading = currentUserQuery.isLoading;

    const logout = useCallback(() => {
        clearAccessToken();
        setTokenState(null);
        queryClient.removeQueries({ queryKey: ['current-user'] });
    }, [queryClient]);

    const persistToken = useCallback((nextToken: string) => {
        setAccessToken(nextToken);
        setTokenState(nextToken);
    }, []);

    const applyToken = useCallback(
        async (nextToken: string) => {
            persistToken(nextToken);
            return queryClient.fetchQuery({
                queryKey: ['current-user'],
                queryFn: getCurrentUser,
            });
        },
        [persistToken, queryClient],
    );

    const refetchUser = useCallback(async () => {
        const result = await currentUserQuery.refetch();
        return result.data;
    }, [currentUserQuery]);

    useEffect(() => {
        if (
            currentUserError instanceof ApiError &&
            currentUserError.status === 401
        ) {
            queueMicrotask(logout);
        }
    }, [currentUserError, logout]);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            user: currentUser,
            isLoading: Boolean(token) && currentUserLoading,
            isAuthenticated: Boolean(token && currentUser),
            hasActiveOrganization: Boolean(currentUser?.organizationId),
            setToken: persistToken,
            applyToken,
            logout,
            refetchUser,
        }),
        [
            applyToken,
            currentUser,
            currentUserLoading,
            logout,
            persistToken,
            refetchUser,
            token,
        ],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
