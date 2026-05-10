'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown, FolderPlus, X } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import type { ProjectFolder, ProjectSummary } from '@/shared/lib';

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (project: ProjectSummary) => void;
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
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [folderId, setFolderId] = useState('none');

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setName('');
                setDescription('');
                setFolderId('none');
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
        () => normalizeInitials(trimmedName || 'Новый проект'),
        [trimmedName],
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
                className="w-full max-w-[36rem] overflow-hidden rounded-[18px] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="create-project-title"
                                className="text-[1.75rem] leading-8 font-semibold text-foreground"
                            >
                                Создать проект
                            </h2>
                            <p className="mt-2 text-base leading-6 text-muted-foreground">
                                Новый проект появится в списке проектов в
                                рабочем пространстве.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-1 rounded-lg text-muted-foreground hover:bg-slate-100"
                            onClick={() => handleOpenChange(false)}
                        >
                            <X className="size-4" />
                            <span className="sr-only">Закрыть окно</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-5 px-5 py-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-slate-50 px-4 py-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
                            {previewInitials}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">
                                {trimmedName || 'Новый проект'}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                Предпросмотр карточки проекта в сайдбаре
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="project-name"
                            className="text-sm font-medium text-foreground"
                        >
                            Название проекта
                        </label>
                        <Input
                            id="project-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            uiSize="lg"
                            placeholder="Например, Sprintly Mobile"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="project-description"
                            className="text-sm font-medium text-foreground"
                        >
                            Описание
                        </label>
                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            rows={4}
                            placeholder="Коротко опишите назначение проекта"
                            className="w-full resize-none rounded-xl border border-input bg-input/20 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="project-folder"
                            className="text-sm font-medium text-foreground"
                        >
                            Папка
                        </label>
                        <div className="relative">
                            <select
                                id="project-folder"
                                value={folderId}
                                onChange={(event) =>
                                    setFolderId(event.target.value)
                                }
                                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-input/20 pr-10 pl-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                            >
                                <option value="none">Без папки</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={() => handleOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        className="rounded-xl px-6"
                        disabled={!canSubmit}
                        onClick={() => {
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
                                    'Новый проект в рабочем пространстве.',
                                boardTabs: normalizeBoardTabs(trimmedName),
                                memberCount: 1,
                                folderId:
                                    folderId === 'none' ? undefined : folderId,
                            };

                            onSubmit(nextProject);
                            handleOpenChange(false);
                        }}
                    >
                        <FolderPlus className="size-4" />
                        Создать проект
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectDialog;
