'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPostAuthRedirectPath, useAuth } from '@/shared/lib';
import { AuthLoadingScreen } from '@/shared/ui/auth-loading-screen';

export function GuestGuard({ children }: PropsWithChildren) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace(getPostAuthRedirectPath(user));
        }
    }, [isAuthenticated, router, user]);

    if (isLoading || isAuthenticated) {
        return <AuthLoadingScreen />;
    }

    return children;
}
