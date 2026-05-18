'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImageUp, LoaderCircle, Trash2, X } from 'lucide-react';
import { ApiError, getUsers, type ProjectStatus } from '@/shared/api';
import { getImageUploadError, MAX_IMAGE_SIZE_MB } from '@/shared/lib/utils';
import { Button, Input, ProjectAvatar } from '@/shared/ui';
import { type ProjectSummary, useCurrentUser } from '@/shared/lib';

type ManageProjectDialogProps = {
    open: boolean;
    project: ProjectSummary | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (project: ProjectSummary) => Promise<void>;
    onUploadImage: (projectId: string, file: File) => Promise<void>;
    onDelete: (projectId: string) => Promise<void>;
};

export function ManageProjectDialog({
    open,
    project,
    onOpenChange,
    onSubmit,
    onUploadImage,
    onDelete,
}: ManageProjectDialogProps) {
    const { data: currentUser } = useCurrentUser();
    const canManageUsers = Boolean(
        currentUser?.roles.some(
            (role) => role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER',
        ),
    );
    const [name, setName] = useState(project?.name ?? '');
    const [description, setDescription] = useState(project?.description ?? '');
    const [status, setStatus] = useState<ProjectStatus>(
        project?.status ?? 'PLANNING',
    );
    const [ownerId, setOwnerId] = useState(project?.ownerId ?? '');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    useEffect(() => {
        if (!project) {
            return;
        }

        setName(project.name);
        setDescription(project.description ?? '');
        setStatus(project.status);
        setOwnerId(project.ownerId ?? '');
    }, [project]);

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setName(project?.name ?? '');
                setDescription(project?.description ?? '');
                setStatus(project?.status ?? 'PLANNING');
                setOwnerId(project?.ownerId ?? '');
                setSelectedImage(null);
                setImageError(null);
                setSubmitError(null);
                setIsSubmitting(false);
                setIsDeleting(false);
            }

            onOpenChange(nextOpen);
        },
        [onOpenChange, project],
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
                description: description.trim(),
                status,
                ownerId: ownerId || undefined,
            });
            if (selectedImage) {
                await onUploadImage(project.id, selectedImage);
            }
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
                    <div className="flex items-center gap-4 rounded-2xl px-4 py-3">
                        <ProjectAvatar
                            size="2xl"
                            shape="square"
                            className={project.avatarClassName}
                            imageUrl={project.imageUrl}
                            fallback={project.avatar}
                            alt={project.name}
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="text-sm font-medium text-foreground">
                                Изображение проекта
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-input/20 px-3 py-2 text-sm text-foreground transition-colors hover:border-ring">
                                <ImageUp className="size-4" />
                                <span className="truncate">
                                    {selectedImage
                                        ? selectedImage.name
                                        : 'Выбрать файл'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    disabled={isSubmitting || isDeleting}
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;

                                        if (!file) {
                                            setSelectedImage(null);
                                            setImageError(null);
                                            return;
                                        }

                                        const nextImageError =
                                            getImageUploadError(file);

                                        if (nextImageError) {
                                            setSelectedImage(null);
                                            setImageError(nextImageError);
                                            event.target.value = '';
                                            return;
                                        }

                                        setSelectedImage(file);
                                        setImageError(null);
                                    }}
                                />
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Максимум {MAX_IMAGE_SIZE_MB} МБ
                            </p>
                            {imageError ? (
                                <p className="text-sm text-destructive">
                                    {imageError}
                                </p>
                            ) : null}
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <label
                            htmlFor="manage-project-description"
                            className="text-sm font-medium text-foreground"
                        >
                            Описание
                        </label>
                        <textarea
                            id="manage-project-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            rows={4}
                            placeholder="Коротко опишите цель проекта, команду или контекст."
                            disabled={isSubmitting || isDeleting}
                            className="w-full resize-none rounded-xl border border-input bg-input/20 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
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
                                    (usersQuery.isLoading &&
                                        ownerOptions.length === 0)
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
