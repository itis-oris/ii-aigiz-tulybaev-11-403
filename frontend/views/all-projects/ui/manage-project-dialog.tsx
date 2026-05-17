'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle, Trash2, X } from 'lucide-react';
import { ApiError, getUsers, type ProjectStatus } from '@/shared/api';
import { Button, Input } from '@/shared/ui';
import { type ProjectSummary } from '@/shared/lib';

type ManageProjectDialogProps = {
    open: boolean;
    project: ProjectSummary | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (project: ProjectSummary) => Promise<void>;
    onDelete: (projectId: string) => Promise<void>;
};

export function ManageProjectDialog({
    open,
    project,
    onOpenChange,
    onSubmit,
    onDelete,
}: ManageProjectDialogProps) {
    const [name, setName] = useState(project?.name ?? '');
    const [status, setStatus] = useState<ProjectStatus>(
        project?.status ?? 'PLANNING',
    );
    const [ownerId, setOwnerId] = useState(project?.ownerId ?? '');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        enabled: open,
        retry: false,
    });

    const ownerOptions = useMemo(
        () =>
            (usersQuery.data ?? []).map((user) => ({
                id: user.id,
                label:
                    [user.firstname, user.lastname]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || user.email,
            })),
        [usersQuery.data],
    );

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setSubmitError(null);
                setIsSubmitting(false);
                setIsDeleting(false);
            }

            onOpenChange(nextOpen);
        },
        [onOpenChange],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting && !isDeleting) {
                handleOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleOpenChange, isDeleting, isSubmitting, open]);

    if (!open || !project) {
        return null;
    }

    const handleSave = async () => {
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            await onSubmit({
                ...project,
                name: name.trim(),
                status,
                ownerId: ownerId || undefined,
            });
            handleOpenChange(false);
        } catch (error) {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось обновить проект',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitError(null);
        setIsDeleting(true);

        try {
            await onDelete(project.id);
            handleOpenChange(false);
        } catch (error) {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось удалить проект',
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-8 md:items-center"
            onClick={() => {
                if (!isSubmitting && !isDeleting) {
                    handleOpenChange(false);
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="manage-project-title"
                className="w-full max-w-[30rem] overflow-hidden rounded-[18px] border border-border bg-card text-card-foreground shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="manage-project-title"
                                className="text-2xl font-semibold text-foreground"
                            >
                                Настройки проекта
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Измените название проекта или удалите его.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-1 rounded-lg text-muted-foreground"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting || isDeleting}
                        >
                            <X className="size-4" />
                            <span className="sr-only">Закрыть диалог</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 px-5 py-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="manage-project-name"
                            className="text-sm font-medium text-foreground"
                        >
                            Название проекта
                        </label>
                        <Input
                            id="manage-project-name"
                            uiSize="lg"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Например, Sprintly Web"
                            disabled={isSubmitting || isDeleting}
                            autoFocus
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="manage-project-status"
                                className="text-sm font-medium text-foreground"
                            >
                                Статус
                            </label>
                            <select
                                id="manage-project-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as ProjectStatus,
                                    )
                                }
                                disabled={isSubmitting || isDeleting}
                                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-input/20 px-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                            >
                                <option value="PLANNING">Планирование</option>
                                <option value="ACTIVE">В работе</option>
                                <option value="ON_HOLD">На паузе</option>
                                <option value="COMPLETED">Завершен</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="manage-project-owner"
                                className="text-sm font-medium text-foreground"
                            >
                                Владелец
                            </label>
                            <select
                                id="manage-project-owner"
                                value={ownerId}
                                onChange={(event) =>
                                    setOwnerId(event.target.value)
                                }
                                disabled={
                                    isSubmitting ||
                                    isDeleting ||
                                    usersQuery.isLoading ||
                                    ownerOptions.length === 0
                                }
                                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-input/20 px-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
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
                    </div>

                    {submitError ? (
                        <p className="text-sm text-destructive">
                            {submitError}
                        </p>
                    ) : null}
                    {usersQuery.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить участников организации
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="destructive"
                        size="xl"
                        className="rounded-xl px-6 sm:mr-auto"
                        onClick={handleDelete}
                        disabled={isSubmitting || isDeleting}
                    >
                        {isDeleting ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                        Удалить проект
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting || isDeleting}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={handleSave}
                        disabled={!name.trim() || isSubmitting || isDeleting}
                    >
                        {isSubmitting ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : null}
                        Сохранить
                    </Button>
                </div>
            </div>
        </div>
    );
}
