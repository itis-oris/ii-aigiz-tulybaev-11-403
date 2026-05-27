'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/lib';
import { AuthLoadingScreen } from '@/shared/ui/auth-loading-screen';

export function OrganizationSetupGuard({ children }: PropsWithChildren) {
    const router = useRouter();
    const { hasActiveOrganization, isAuthenticated, isLoading, token } =
        useAuth();

    useEffect(() => {
        if (!token) {
            router.replace('/login');
            return;
        }

        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (isAuthenticated && hasActiveOrganization) {
            router.replace('/');
        }
    }, [hasActiveOrganization, isAuthenticated, isLoading, router, token]);

    if (!token || isLoading || !isAuthenticated || hasActiveOrganization) {
        return <AuthLoadingScreen />;
    }

    return children;
}
