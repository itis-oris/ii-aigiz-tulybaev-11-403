'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    acceptOrganizationInvitation,
    ApiError,
    getOrganizationInvitation,
} from '@/shared/api';
import { getPostAuthRedirectPath, useAuth } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { AuthCard } from '@/widgets/auth-shell';

type InvitationPageProps = {
    token: string;
};

export default function InvitationPage({ token }: InvitationPageProps) {
    const router = useRouter();
    const { applyToken, isAuthenticated, user } = useAuth();
    const invitationQuery = useQuery({
        queryKey: ['organization-invitation', token],
        queryFn: () => getOrganizationInvitation(token),
        retry: false,
    });
    const acceptInvitationMutation = useMutation({
        mutationFn: () => acceptOrganizationInvitation(token),
        onSuccess: async (data) => {
            const nextUser = await applyToken(data.accessToken);
            router.replace(getPostAuthRedirectPath(nextUser ?? null));
        },
    });

    const invitation = invitationQuery.data;
    const errorMessage =
        invitationQuery.error instanceof ApiError
            ? invitationQuery.error.message
            : acceptInvitationMutation.error instanceof ApiError
              ? acceptInvitationMutation.error.message
              : null;

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <AuthCard
                title="Приглашение в рабочее пространство"
                description={
                    invitation
                        ? `Вы приглашены в ${invitation.organizationName}.`
                        : 'Проверяем приглашение.'
                }
            >
                <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                    {invitationQuery.isLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Загружаем приглашение...
                        </p>
                    ) : null}

                    {invitation ? (
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {invitation.email ? (
                                <p>
                                    Приглашение закреплено за {invitation.email}
                                    .
                                </p>
                            ) : (
                                <p>Это приглашение по ссылке.</p>
                            )}
                            <p>
                                Действует до{' '}
                                {new Intl.DateTimeFormat('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }).format(new Date(invitation.expiresAt))}
                                .
                            </p>
                        </div>
                    ) : null}

                    {errorMessage ? (
                        <p className="text-sm text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}

                    {isAuthenticated ? (
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                size="xl"
                                className="flex-1"
                                disabled={
                                    !invitation ||
                                    invitation.accepted ||
                                    invitation.revoked ||
                                    invitation.expired ||
                                    acceptInvitationMutation.isPending
                                }
                                onClick={() =>
                                    acceptInvitationMutation.mutateAsync()
                                }
                            >
                                {invitation?.accepted
                                    ? 'Приглашение уже принято'
                                    : 'Присоединиться'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="xl"
                                className="flex-1"
                                onClick={() =>
                                    router.push(getPostAuthRedirectPath(user))
                                }
                            >
                                В рабочее пространство
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                asChild
                                type="button"
                                size="xl"
                                className="flex-1"
                            >
                                <Link
                                    href={`/login?invite=${encodeURIComponent(token)}`}
                                >
                                    Войти
                                </Link>
                            </Button>
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                size="xl"
                                className="flex-1"
                            >
                                <Link
                                    href={`/register?invite=${encodeURIComponent(token)}`}
                                >
                                    Регистрация
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </AuthCard>
        </main>
    );
}
