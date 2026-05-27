'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
    ApiError,
    createOrganization,
    switchOrganization,
    type OrganizationResponse,
} from '@/shared/api';
import { getPostAuthRedirectPath, useAuth } from '@/shared/lib';
import {
    AuthCard,
    AuthFormError,
    OrganizationSetupGuard,
} from '@/widgets/auth-shell';
import { Button, Input } from '@/shared/ui';

export default function SetupOrganizationPage() {
    const router = useRouter();
    const { applyToken, user } = useAuth();
    const [name, setName] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    const applySession = useCallback(
        async (accessToken: string) => {
            const nextUser = await applyToken(accessToken);
            router.replace(getPostAuthRedirectPath(nextUser ?? null));
        },
        [applyToken, router],
    );

    const createOrganizationMutation = useMutation({
        mutationFn: createOrganization,
        onSuccess: async (data) => {
            await applySession(data.accessToken);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось создать организацию',
            );
        },
    });

    const switchOrganizationMutation = useMutation({
        mutationFn: switchOrganization,
        onSuccess: async (data) => {
            await applySession(data.accessToken);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось переключить организацию',
            );
        },
    });

    const handleCreate = async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setSubmitError('Введите название организации');
            return;
        }

        setSubmitError(null);
        try {
            await createOrganizationMutation.mutateAsync({ name: trimmedName });
        } catch {}
    };

    const handleSwitch = useCallback(
        async (organization: OrganizationResponse) => {
            setSubmitError(null);
            try {
                await switchOrganizationMutation.mutateAsync(organization.id);
            } catch {}
        },
        [switchOrganizationMutation],
    );

    useEffect(() => {
        if (user?.organizations?.length === 1 && !user.organizationId) {
            queueMicrotask(() => {
                void handleSwitch(user.organizations[0]);
            });
        }
    }, [handleSwitch, user]);

    const isAutoSwitching =
        switchOrganizationMutation.isPending &&
        user?.organizations?.length === 1 &&
        !user.organizationId;

    return (
        <OrganizationSetupGuard>
            <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
                <AuthCard
                    title="Настрой рабочее пространство"
                    description="Этот экран нужен только если у аккаунта еще нет активной организации."
                >
                    <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                        {isAutoSwitching ? (
                            <p className="text-sm text-muted-foreground">
                                Подключаем организацию...
                            </p>
                        ) : null}

                        {user?.organizations?.length ? (
                            <div className="space-y-2">
                                {user.organizations.map((organization) => (
                                    <Button
                                        key={organization.id}
                                        type="button"
                                        variant="outline"
                                        size="xl"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            handleSwitch(organization)
                                        }
                                        disabled={
                                            switchOrganizationMutation.isPending ||
                                            isAutoSwitching
                                        }
                                    >
                                        {organization.name}
                                    </Button>
                                ))}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Новая организация
                            </label>
                            <Input
                                uiSize="md"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Sprintly Team"
                            />
                        </div>

                        {submitError ? (
                            <AuthFormError message={submitError} />
                        ) : null}

                        <Button
                            type="button"
                            size="xl"
                            className="w-full"
                            onClick={handleCreate}
                            disabled={
                                createOrganizationMutation.isPending ||
                                isAutoSwitching
                            }
                        >
                            Создать организацию
                        </Button>
                    </div>
                </AuthCard>
            </main>
        </OrganizationSetupGuard>
    );
}
