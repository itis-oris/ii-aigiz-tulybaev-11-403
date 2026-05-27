import type { CurrentUserResponse } from '@/shared/api';

export function getPostAuthRedirectPath(user: CurrentUserResponse | null) {
    if (!user?.organizationId) {
        return '/setup-organization';
    }

    return '/';
}
