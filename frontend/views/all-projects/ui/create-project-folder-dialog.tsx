'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderPlus, X } from 'lucide-react';
import { getUsers } from '@/shared/api';
import { useCurrentUser, useI18n, type ProjectFolder } from '@/shared/lib';
import { Button, Input } from '@/shared/ui';

type CreateProjectFolderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (folder: ProjectFolder) => Promise<void> | void;
};

const CreateProjectFolderDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateProjectFolderDialogProps) => {
    const { t } = useI18n();
    const { data: currentUser } = useCurrentUser();
    const canManageUsers = Boolean(
        currentUser?.roles.some(
            (role) => role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER',
        ),
    );
    const [name, setName] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        enabled: open && canManageUsers,
        retry: false,
    });
    const ownerOptions = useMemo(() => {
        const currentUserOption = currentUser
            ? {
                  id: currentUser.userId,
                  label:
                      [currentUser.firstname, currentUser.lastname]
                          .filter(Boolean)
                          .join(' ')
                          .trim() || currentUser.email,
              }
            : null;

        const fetchedOptions = (usersQuery.data ?? []).map((user) => ({
            id: user.id,
            label:
                [user.firstname, user.lastname]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || user.email,
        }));

        const uniqueOptions = new Map<string, { id: string; label: string }>();

        if (currentUserOption) {
            uniqueOptions.set(currentUserOption.id, currentUserOption);
        }

        fetchedOptions.forEach((option) => {
            uniqueOptions.set(option.id, option);
        });

        return [...uniqueOptions.values()];
    }, [currentUser, usersQuery.data]);

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setName('');
                setOwnerId('');
            } else {
                setOwnerId(currentUser?.userId ?? '');
            }

            onOpenChange(nextOpen);
        },
        [currentUser?.userId, onOpenChange],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleOpenChange, open]);

    const trimmedName = name.trim();

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-8 md:items-center"
            onClick={() => handleOpenChange(false)}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-project-folder-title"
                className="w-full max-w-[32rem] overflow-hidden rounded-[18px] border border-border bg-card text-card-foreground shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="create-project-folder-title"
                                className="text-[1.75rem] leading-8 font-semibold text-foreground"
                            >
                                {t('dialogs.createFolderTitle')}
                            </h2>
                            <p className="mt-2 text-base leading-6 text-muted-foreground">
                                {t('dialogs.createFolderDescription')}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-1 rounded-lg text-muted-foreground"
                            onClick={() => handleOpenChange(false)}
                        >
                            <X className="size-4" />
                            <span className="sr-only">
                                {t('common.closeDialog')}
                            </span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-5 px-5 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="project-folder-name"
                            className="text-sm font-medium text-foreground"
                        >
                            {t('dialogs.folderName')}
                        </label>
                        <Input
                            id="project-folder-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            uiSize="lg"
                            placeholder={t('dialogs.folderNamePlaceholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="project-folder-owner"
                            className="text-sm font-medium text-foreground"
                        >
                            Владелец
                        </label>
                        <select
                            id="project-folder-owner"
                            value={ownerId}
                            onChange={(event) => setOwnerId(event.target.value)}
                            disabled={
                                usersQuery.isLoading &&
                                ownerOptions.length === 0
                            }
                            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-input/20 px-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <option value="">
                                {usersQuery.isLoading
                                    ? 'Загрузка...'
                                    : ownerOptions.length > 0
                                      ? 'Выберите владельца'
                                      : 'Нет доступных участников'}
                            </option>
                            {ownerOptions.map((owner) => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {usersQuery.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить участников организации
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={() => handleOpenChange(false)}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        className="rounded-xl px-6"
                        disabled={!trimmedName}
                        onClick={async () => {
                            await onSubmit({
                                id: `folder-${Date.now()}`,
                                name: trimmedName,
                                ownerId: ownerId || undefined,
                            });
                            handleOpenChange(false);
                        }}
                    >
                        <FolderPlus className="size-4" />
                        {t('dialogs.createFolder')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectFolderDialog;
