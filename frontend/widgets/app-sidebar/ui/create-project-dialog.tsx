'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown, FolderPlus, ImageUp, X } from 'lucide-react';
import { ApiError, getUsers, type ProjectStatus } from '@/shared/api';
import { Button, Input } from '@/shared/ui';
import {
    hasOrgAdminRole,
    useCurrentUser,
    useI18n,
    type ProjectFolder,
    type ProjectSummary,
} from '@/shared/lib';
import { getImageUploadError, MAX_IMAGE_SIZE_MB } from '@/shared/lib/utils';

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (project: ProjectSummary) => Promise<void> | void;
    projectCount: number;
    folders: ProjectFolder[];
};

const projectAccentPalette = [
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

const normalizeInitials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2);

const normalizeBoardTabs = (name: string) => {
    const sanitized = name
        .trim()
        .split(/\s+/)
        .map((part) => part.replace(/[^a-zA-Zа-яА-Я0-9]/g, ''))
        .filter(Boolean);

    if (!sanitized.length) {
        return ['BACKLOG', 'IN PROGRESS', 'DONE'];
    }

    return [sanitized[0].slice(0, 8).toUpperCase(), 'IN PROGRESS', 'DONE'];
};

const CreateProjectDialog = ({
    open,
    onOpenChange,
    onSubmit,
    projectCount,
    folders,
}: CreateProjectDialogProps) => {
    const { t } = useI18n();
    const { data: currentUser } = useCurrentUser();
    const canManageUsers = hasOrgAdminRole(currentUser?.roles);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [folderId, setFolderId] = useState('none');
    const [status, setStatus] = useState<ProjectStatus>('PLANNING');
    const [ownerId, setOwnerId] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                setDescription('');
                setFolderId('none');
                setStatus('PLANNING');
                setOwnerId('');
                setSelectedImage(null);
                setImageError(null);
                setSubmitError(null);
                setIsSubmitting(false);
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
    const canSubmit = trimmedName.length > 0;
    const previewInitials = useMemo(
        () => normalizeInitials(trimmedName || t('dialogs.newProject')),
        [t, trimmedName],
    );

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
                aria-labelledby="create-project-title"
                className="w-full max-w-[36rem] overflow-hidden rounded-[18px] border border-border bg-card text-card-foreground shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="create-project-title"
                                className="text-[1.75rem] leading-8 font-semibold text-foreground"
                            >
                                {t('dialogs.createProjectTitle')}
                            </h2>
                            <p className="mt-2 text-base leading-6 text-muted-foreground">
                                {t('dialogs.createProjectDescription')}
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
                        <label className="text-sm font-medium text-foreground mr-4">
                            Изображение проекта
                        </label>
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
                                disabled={isSubmitting}
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

                    <div className="space-y-2">
                        <label
                            htmlFor="project-name"
                            className="text-sm font-medium text-foreground"
                        >
                            {t('dialogs.projectName')}
                        </label>
                        <Input
                            id="project-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            uiSize="lg"
                            placeholder={t('dialogs.projectNamePlaceholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="project-description"
                            className="text-sm font-medium text-foreground"
                        >
                            {t('dialogs.projectDescription')}
                        </label>
                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            rows={4}
                            placeholder={t(
                                'dialogs.projectDescriptionPlaceholder',
                            )}
                            className="w-full resize-none rounded-xl border border-input bg-input/20 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="project-folder"
                            className="text-sm font-medium text-foreground"
                        >
                            {t('dialogs.folder')}
                        </label>
                        <div className="relative">
                            <select
                                id="project-folder"
                                value={folderId}
                                onChange={(event) =>
                                    setFolderId(event.target.value)
                                }
                                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-input/20 pr-10 pl-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                            >
                                <option value="none">
                                    {t('dialogs.noFolder')}
                                </option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="project-status"
                                className="text-sm font-medium text-foreground"
                            >
                                Статус
                            </label>
                            <select
                                id="project-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as ProjectStatus,
                                    )
                                }
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
                                htmlFor="project-owner"
                                className="text-sm font-medium text-foreground"
                            >
                                Владелец
                            </label>
                            <select
                                id="project-owner"
                                value={ownerId}
                                onChange={(event) =>
                                    setOwnerId(event.target.value)
                                }
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
                        disabled={isSubmitting}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        className="rounded-xl px-6"
                        disabled={!canSubmit || isSubmitting}
                        onClick={async () => {
                            const nextProject: ProjectSummary = {
                                id: `project-${Date.now()}`,
                                name: trimmedName,
                                shortLabel: previewInitials,
                                avatar: previewInitials,
                                avatarClassName:
                                    projectAccentPalette[
                                        projectCount %
                                            projectAccentPalette.length
                                    ],
                                description:
                                    description.trim() ||
                                    t('dialogs.newWorkspaceProject'),
                                boardTabs: normalizeBoardTabs(trimmedName),
                                status,
                                memberCount: 1,
                                imageFile: selectedImage,
                                ownerId: ownerId || undefined,
                                folderId:
                                    folderId === 'none' ? undefined : folderId,
                            };

                            setSubmitError(null);
                            setIsSubmitting(true);

                            try {
                                await onSubmit(nextProject);
                                handleOpenChange(false);
                            } catch (error) {
                                setSubmitError(
                                    error instanceof ApiError
                                        ? error.message
                                        : 'Не удалось создать проект',
                                );
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        <FolderPlus className="size-4" />
                        {t('dialogs.createProject')}
                    </Button>
                </div>
                {submitError ? (
                    <div className="border-t border-border px-5 py-3 text-sm text-destructive">
                        {submitError}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default CreateProjectDialog;
