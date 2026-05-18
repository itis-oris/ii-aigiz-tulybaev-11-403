'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ApiError,
    createOrganization,
    deleteOrganization,
    switchOrganization,
    updateOrganization,
} from '@/shared/api';
import { cn, useAuth, useCurrentUser, useI18n } from '@/shared/lib';
import {
    Check,
    ChevronDown,
    LoaderCircle,
    Plus,
    Settings2,
    UserPlus,
} from 'lucide-react';
import { Avatar, Button } from '@/shared/ui';
import { OrganizationDialog } from './organization-dialog';

type WorkspaceSwitcherProps = {
    onInviteClick: () => void;
};

export default function WorkspaceSwitcher({
    onInviteClick,
}: WorkspaceSwitcherProps) {
    const queryClient = useQueryClient();
    const { applyToken } = useAuth();
    const { data: user } = useCurrentUser();
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const organizations = user?.organizations ?? [];
    const activeOrganization =
        organizations.find((organization) => organization.active) ?? null;
    const label =
        activeOrganization?.name ?? user?.organizationName ?? 'Workspace';
    const shortLabel = label[0]?.toUpperCase() ?? 'W';
    const canEditActiveOrganization =
        Boolean(activeOrganization) &&
        activeOrganization?.ownerId === user?.userId;
    const canDeleteActiveOrganization =
        canEditActiveOrganization && organizations.length > 1;

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, []);

    const applyOrganizationSession = async (accessToken: string) => {
        await applyToken(accessToken);
        await queryClient.invalidateQueries();
        setIsOpen(false);
    };

    const createOrganizationMutation = useMutation({
        mutationFn: createOrganization,
        onSuccess: async (data) => {
            await applyOrganizationSession(data.accessToken);
            setCreateOpen(false);
            setSubmitError(null);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : t('organization.createError'),
            );
        },
    });

    const switchOrganizationMutation = useMutation({
        mutationFn: switchOrganization,
        onSuccess: async (data) => {
            await applyOrganizationSession(data.accessToken);
            setSubmitError(null);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : t('organization.switchError'),
            );
        },
    });

    const updateOrganizationMutation = useMutation({
        mutationFn: ({
            organizationId,
            name,
        }: {
            organizationId: string;
            name: string;
        }) => updateOrganization(organizationId, { name }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['current-user'] });
            setEditOpen(false);
            setSubmitError(null);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : t('organization.updateError'),
            );
        },
    });

    const deleteOrganizationMutation = useMutation({
        mutationFn: deleteOrganization,
        onSuccess: async (data) => {
            await applyOrganizationSession(data.accessToken);
            setEditOpen(false);
            setSubmitError(null);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : t('organization.deleteError'),
            );
        },
    });

    const handleCreate = async (name: string) => {
        setSubmitError(null);
        try {
            await createOrganizationMutation.mutateAsync({ name });
        } catch {}
    };

    const handleSwitch = async (organizationId: string) => {
        setSubmitError(null);
        try {
            await switchOrganizationMutation.mutateAsync(organizationId);
        } catch {}
    };

    const handleUpdate = async (name: string) => {
        if (!activeOrganization) {
            return;
        }

        setSubmitError(null);
        try {
            await updateOrganizationMutation.mutateAsync({
                organizationId: activeOrganization.id,
                name,
            });
        } catch {}
    };

    const handleDelete = async () => {
        if (!activeOrganization || !canDeleteActiveOrganization) {
            return;
        }

        setSubmitError(null);
        try {
            await deleteOrganizationMutation.mutateAsync(activeOrganization.id);
        } catch {}
    };

    const isPending =
        createOrganizationMutation.isPending ||
        switchOrganizationMutation.isPending ||
        updateOrganizationMutation.isPending ||
        deleteOrganizationMutation.isPending;

    return (
        <>
            <div
                ref={containerRef}
                className="relative min-w-0 flex-1 group-data-[collapsible=icon]:flex-none"
            >
                <button
                    type="button"
                    onClick={() => setIsOpen((open) => !open)}
                    aria-expanded={isOpen}
                    aria-label={t('organization.openMenu')}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                    <Avatar
                        size="sm"
                        shape="square"
                        className="bg-sidebar-accent text-sidebar-foreground"
                    >
                        {shortLabel}
                    </Avatar>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <div className="truncate text-sm font-semibold text-sidebar-foreground">
                            {label}
                        </div>
                    </div>
                    <ChevronDown className="ml-auto size-4 text-sidebar-foreground/65 group-data-[collapsible=icon]:hidden" />
                </button>

                <div
                    className={cn(
                        'absolute top-full left-0 z-40 mt-2 hidden w-[18.5rem] rounded-2xl border border-sidebar-border bg-sidebar p-3 shadow-lg',
                        'group-data-[collapsible=icon]:hidden',
                        isOpen && 'block',
                    )}
                >
                    <div className="flex items-start gap-3 rounded-xl px-1 pb-3">
                        <Avatar
                            size="md"
                            shape="square"
                            className="bg-sidebar-accent text-sidebar-foreground"
                        >
                            {shortLabel}
                        </Avatar>
                        <div className="min-w-0">
                            <div className="truncate text-[1.05rem] font-medium text-sidebar-foreground">
                                {label}
                            </div>
                            <div className="text-sm text-sidebar-foreground/55">
                                {t('organization.count', {
                                    count: organizations.length,
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pb-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl border-sidebar-border bg-sidebar px-3 text-sm"
                            onClick={() => {
                                setSubmitError(null);
                                setEditOpen(true);
                            }}
                            disabled={!canEditActiveOrganization || isPending}
                        >
                            <Settings2 className="size-4" />
                            <span>{t('sidebar.settings')}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl border-sidebar-border bg-sidebar px-3 text-sm"
                            onClick={() => {
                                setIsOpen(false);
                                onInviteClick();
                            }}
                        >
                            <UserPlus className="size-4" />
                            <span>{t('sidebar.invite')}</span>
                        </Button>
                    </div>

                    <div className="border-t border-sidebar-border pt-3">
                        <div className="space-y-1">
                            {organizations.map((organization) => (
                                <button
                                    key={organization.id}
                                    type="button"
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent',
                                        organization.active &&
                                            'bg-sidebar-accent/70',
                                    )}
                                    onClick={() =>
                                        handleSwitch(organization.id)
                                    }
                                    disabled={organization.active || isPending}
                                >
                                    <Avatar
                                        size="xs"
                                        shape="square"
                                        className="bg-sidebar-accent text-sidebar-foreground"
                                    >
                                        {organization.name[0]?.toUpperCase() ??
                                            'W'}
                                    </Avatar>
                                    <span className="min-w-0 flex-1 truncate text-sm text-sidebar-foreground">
                                        {organization.name}
                                    </span>
                                    {switchOrganizationMutation.isPending &&
                                    !organization.active ? (
                                        <LoaderCircle className="size-4 animate-spin text-sidebar-foreground/55" />
                                    ) : organization.active ? (
                                        <Check className="size-4 text-sidebar-foreground/55" />
                                    ) : null}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                onClick={() => {
                                    setSubmitError(null);
                                    setCreateOpen(true);
                                }}
                                disabled={isPending}
                            >
                                <Plus className="size-4" />
                                <span>{t('organization.createAction')}</span>
                            </button>

                            {submitError ? (
                                <p className="px-2 pt-1 text-xs text-destructive">
                                    {submitError}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <OrganizationDialog
                key={`create-${createOpen ? 'open' : 'closed'}`}
                open={createOpen}
                mode="create"
                pending={createOrganizationMutation.isPending}
                error={submitError}
                onOpenChange={(open) => {
                    setCreateOpen(open);
                    if (!open) {
                        setSubmitError(null);
                    }
                }}
                onSubmit={handleCreate}
            />

            <OrganizationDialog
                key={`edit-${activeOrganization?.id ?? 'none'}-${activeOrganization?.name ?? ''}-${editOpen ? 'open' : 'closed'}`}
                open={editOpen}
                mode="edit"
                initialName={activeOrganization?.name ?? ''}
                pending={updateOrganizationMutation.isPending}
                canDelete={canDeleteActiveOrganization}
                deletePending={deleteOrganizationMutation.isPending}
                error={submitError}
                onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) {
                        setSubmitError(null);
                    }
                }}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
            />
        </>
    );
}
