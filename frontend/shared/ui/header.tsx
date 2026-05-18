'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical, PencilLine, Plus, Tags, Trash2 } from 'lucide-react';

import {
    cn,
    projectTabs,
    type ProjectSummary,
    type ProjectTab,
    useActiveProject,
} from '@/shared/lib';
import { getTagBadgeStyle } from '@/shared/lib/tag-color/index';
import {
    createBoard,
    createTag,
    deleteBoard,
    deleteTag,
    getBoards,
    getTags,
    updateTag,
    type BoardResponse,
    type CreateBoardRequest,
} from '@/shared/api';
import {
    Badge,
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ProjectAvatar,
} from '@/shared/ui';

type HeaderProps = React.ComponentProps<'header'>;

type HeaderViewProps = HeaderProps & {
    project: ProjectSummary;
    activeProjectTab?: ProjectTab;
    onProjectTabChange?: (tab: ProjectTab) => void;
};

const projectStatusOptions: Array<{
    value: ProjectSummary['status'];
    label: string;
    dotClassName: string;
}> = [
    {
        value: 'ACTIVE',
        label: 'В работе',
        dotClassName: 'bg-green-500',
    },
    {
        value: 'PLANNING',
        label: 'Планирование',
        dotClassName: 'bg-amber-500',
    },
    {
        value: 'ON_HOLD',
        label: 'На паузе',
        dotClassName: 'bg-slate-400',
    },
    {
        value: 'COMPLETED',
        label: 'Завершен',
        dotClassName: 'bg-sky-500',
    },
];

const Header = ({
    className,
    children,
    project,
    activeProjectTab: controlledProjectTab,
    onProjectTabChange,
    ...props
}: HeaderViewProps) => {
    const queryClient = useQueryClient();
    const { activeBoardId, setActiveBoardId, updateProject } =
        useActiveProject();
    const [projectTab, setProjectTab] = useState<ProjectTab>('Задачи');
    const [newBoardName, setNewBoardName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#6366F1');
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingTagName, setEditingTagName] = useState('');
    const [editingTagColor, setEditingTagColor] = useState('#6366F1');
    const boardsQuery = useQuery({
        queryKey: ['boards', project.id],
        queryFn: () => getBoards(project.id),
        enabled: Boolean(project.id) && project.id !== 'empty-project',
        retry: false,
    });
    const tagsQuery = useQuery({
        queryKey: ['project-tags', project.id],
        queryFn: () => getTags({ projectId: project.id }),
        enabled: Boolean(project.id) && project.id !== 'empty-project',
        retry: false,
    });
    const createBoardMutation = useMutation<
        BoardResponse,
        Error,
        CreateBoardRequest
    >({
        mutationFn: createBoard,
        onSuccess: async (createdBoard) => {
            setActiveBoardId(createdBoard.id);
            setNewBoardName('');
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['projects'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['boards', project.id],
                }),
            ]);
        },
    });
    const createTagMutation = useMutation({
        mutationFn: createTag,
        onSuccess: async () => {
            setNewTagName('');
            setNewTagColor('#6366F1');
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['project-tags', project.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task'],
                }),
            ]);
        },
    });
    const updateTagMutation = useMutation({
        mutationFn: ({
            tagId,
            name,
            color,
        }: {
            tagId: string;
            name: string;
            color: string;
        }) => updateTag(tagId, { name, color }),
        onSuccess: async () => {
            setEditingTagId(null);
            setEditingTagName('');
            setEditingTagColor('#6366F1');
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['project-tags', project.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task'],
                }),
            ]);
        },
    });
    const deleteTagMutation = useMutation({
        mutationFn: deleteTag,
        onSuccess: async (_, deletedTagId) => {
            if (editingTagId === deletedTagId) {
                setEditingTagId(null);
                setEditingTagName('');
                setEditingTagColor('#6366F1');
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['project-tags', project.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task'],
                }),
            ]);
        },
    });
    const deleteBoardMutation = useMutation<null, Error, string>({
        mutationFn: deleteBoard,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['projects'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['boards', project.id],
                }),
            ]);
        },
    });

    const liveBoards = (boardsQuery.data ?? []).map((board) => ({
        id: board.id,
        name: board.name,
        key: board.id,
    }));
    const fallbackBoards = project.boardTabs.map((boardName, index) => ({
        id: boardName,
        name: boardName,
        key: `fallback:${index}:${boardName}`,
    }));
    const effectiveBoards = liveBoards.length > 0 ? liveBoards : fallbackBoards;
    const normalizedNewBoardName = newBoardName.trim().toLowerCase();
    const hasDuplicateBoardName =
        normalizedNewBoardName.length > 0 &&
        effectiveBoards.some(
            (board) =>
                board.name.trim().toLowerCase() === normalizedNewBoardName,
        );

    useEffect(() => {
        const hasActiveBoard = effectiveBoards.some(
            (board) =>
                board.id === activeBoardId || board.name === activeBoardId,
        );

        if (!hasActiveBoard && effectiveBoards[0]) {
            setActiveBoardId(effectiveBoards[0].id);
        }
    }, [activeBoardId, effectiveBoards, setActiveBoardId]);

    const activeProjectTab = controlledProjectTab ?? projectTab;

    const handleProjectTabChange = (tab: ProjectTab) => {
        onProjectTabChange?.(tab);

        if (controlledProjectTab === undefined) {
            setProjectTab(tab);
        }
    };

    const handleCreateBoard = () => {
        const trimmedName = newBoardName.trim();

        if (!trimmedName || hasDuplicateBoardName) {
            return;
        }

        createBoardMutation.mutate({
            name: trimmedName,
            projectId: project.id,
            position: effectiveBoards.length * 1000,
        });
    };

    const handleDeleteBoard = (boardId: string) => {
        if (effectiveBoards.length === 1) {
            return;
        }

        const board = effectiveBoards.find(
            (currentBoard) => currentBoard.id === boardId,
        );

        if (!board) {
            return;
        }

        const remainingBoards = effectiveBoards.filter(
            (currentBoard) => currentBoard.id !== boardId,
        );

        if (activeBoardId === board.id || activeBoardId === board.name) {
            setActiveBoardId(remainingBoards[0]?.id ?? '');
        }

        deleteBoardMutation.mutate(board.id);
    };

    const handleCreateTag = () => {
        const trimmedName = newTagName.trim();

        if (!trimmedName) {
            return;
        }

        createTagMutation.mutate({
            name: trimmedName,
            color: newTagColor,
            projectId: project.id,
        });
    };

    const handleStartEditTag = (tag: {
        id: string;
        name: string;
        color: string;
    }) => {
        setEditingTagId(tag.id);
        setEditingTagName(tag.name);
        setEditingTagColor(tag.color);
    };

    const handleUpdateTag = () => {
        const trimmedName = editingTagName.trim();

        if (!editingTagId || !trimmedName) {
            return;
        }

        updateTagMutation.mutate({
            tagId: editingTagId,
            name: trimmedName,
            color: editingTagColor,
        });
    };

    const handleCancelTagEdit = () => {
        setEditingTagId(null);
        setEditingTagName('');
        setEditingTagColor('#6366F1');
    };

    const activeStatus =
        projectStatusOptions.find(
            (status) => status.value === project.status,
        ) ?? projectStatusOptions[0];

    const handleStatusChange = (status: ProjectSummary['status']) => {
        void updateProject({ ...project, status });
    };

    return (
        <header
            className={cn(
                'w-full border-b border-sidebar-border bg-sidebar px-4 py-2.5 text-sidebar-foreground',
                className,
            )}
            {...props}
        >
            <div className="flex w-full flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <ProjectAvatar
                            size="md"
                            shape="soft"
                            className={project.avatarClassName}
                            imageUrl={project.imageUrl}
                            fallback={project.avatar}
                            alt={project.name}
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="truncate text-base font-semibold leading-none">
                                    {project.name}
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="cursor-pointer"
                                            aria-label="Изменить статус проекта"
                                        >
                                            <Badge
                                                size="sm"
                                                className="bg-sidebar-accent text-sidebar-foreground/80 hover:bg-sidebar-accent/80"
                                            >
                                                <span
                                                    className={cn(
                                                        'size-1.5 rounded-full',
                                                        activeStatus.dotClassName,
                                                    )}
                                                />
                                                {activeStatus.label}
                                            </Badge>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-48 border-sidebar-border bg-sidebar p-2 text-sidebar-foreground"
                                    >
                                        <div className="space-y-1">
                                            {projectStatusOptions.map(
                                                (status) => (
                                                    <button
                                                        key={status.value}
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                status.value,
                                                            )
                                                        }
                                                        className={cn(
                                                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent',
                                                            project.status ===
                                                                status.value &&
                                                                'bg-sidebar-accent',
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'size-2 rounded-full',
                                                                status.dotClassName,
                                                            )}
                                                        />
                                                        <span>
                                                            {status.label}
                                                        </span>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="mt-1 truncate text-xs leading-none text-sidebar-foreground/60">
                                {project.description}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <span className="text-sm font-semibold tracking-[0.04em] text-sidebar-foreground/78">
                            Sprintly
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-lg bg-sidebar-accent/70 p-1">
                        {projectTabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => handleProjectTabChange(tab)}
                                className={cn(
                                    'cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                    activeProjectTab === tab
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'text-sidebar-foreground/65 hover:text-sidebar-foreground',
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                    aria-label="Управление тегами"
                                >
                                    <Tags className="size-4" />
                                    Теги
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-96 border-sidebar-border bg-sidebar p-3 text-sidebar-foreground"
                            >
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium">
                                            Теги проекта
                                        </div>
                                        <div className="mt-1 text-xs text-sidebar-foreground/60">
                                            Создавайте, редактируйте и удаляйте
                                            теги для задач текущего проекта.
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/60 p-2">
                                        <Input
                                            value={newTagName}
                                            onChange={(event) =>
                                                setNewTagName(
                                                    event.target.value,
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    handleCreateTag();
                                                }
                                            }}
                                            placeholder="Новый тег"
                                            uiSize="md"
                                            className="border-sidebar-border bg-sidebar text-sidebar-foreground placeholder:text-sidebar-foreground/45"
                                        />
                                        <input
                                            type="color"
                                            value={newTagColor}
                                            onChange={(event) =>
                                                setNewTagColor(
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-11 cursor-pointer rounded-md border border-sidebar-border bg-transparent p-1"
                                            aria-label="Цвет нового тега"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleCreateTag}
                                            disabled={
                                                !newTagName.trim() ||
                                                createTagMutation.isPending
                                            }
                                            className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/80"
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>

                                    {createTagMutation.error instanceof
                                    Error ? (
                                        <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
                                            {createTagMutation.error.message}
                                        </div>
                                    ) : null}

                                    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                                        {tagsQuery.isFetching ? (
                                            <div className="text-xs text-sidebar-foreground/60">
                                                Загрузка тегов...
                                            </div>
                                        ) : null}

                                        {tagsQuery.error instanceof Error ? (
                                            <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
                                                {tagsQuery.error.message}
                                            </div>
                                        ) : null}

                                        {(tagsQuery.data ?? []).length === 0 &&
                                        !tagsQuery.isFetching ? (
                                            <div className="rounded-md border border-dashed border-sidebar-border px-3 py-4 text-xs text-sidebar-foreground/60">
                                                Тегов пока нет.
                                            </div>
                                        ) : null}

                                        {(tagsQuery.data ?? []).map((tag) => {
                                            const isEditing =
                                                editingTagId === tag.id;

                                            return (
                                                <div
                                                    key={tag.id}
                                                    className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2"
                                                >
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    value={
                                                                        editingTagName
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setEditingTagName(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    onKeyDown={(
                                                                        event,
                                                                    ) => {
                                                                        if (
                                                                            event.key ===
                                                                            'Enter'
                                                                        ) {
                                                                            handleUpdateTag();
                                                                        }
                                                                    }}
                                                                    uiSize="md"
                                                                    className="border-sidebar-border bg-sidebar text-sidebar-foreground"
                                                                />
                                                                <input
                                                                    type="color"
                                                                    value={
                                                                        editingTagColor
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setEditingTagColor(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-9 w-11 cursor-pointer rounded-md border border-sidebar-border bg-transparent p-1"
                                                                    aria-label="Цвет тега"
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={
                                                                        handleCancelTagEdit
                                                                    }
                                                                >
                                                                    Отмена
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={
                                                                        handleUpdateTag
                                                                    }
                                                                    disabled={
                                                                        !editingTagName.trim() ||
                                                                        updateTagMutation.isPending
                                                                    }
                                                                >
                                                                    Сохранить
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between gap-3">
                                                            <Badge
                                                                variant="outline"
                                                                size="sm"
                                                                style={getTagBadgeStyle(
                                                                    tag.color,
                                                                )}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    className="text-sidebar-foreground/70 hover:bg-sidebar hover:text-sidebar-foreground"
                                                                    onClick={() =>
                                                                        handleStartEditTag(
                                                                            tag,
                                                                        )
                                                                    }
                                                                >
                                                                    <PencilLine className="size-3.5" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    className="text-destructive hover:bg-sidebar hover:text-destructive"
                                                                    onClick={() =>
                                                                        deleteTagMutation.mutate(
                                                                            tag.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        deleteTagMutation.isPending
                                                                    }
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {updateTagMutation.error instanceof
                                    Error ? (
                                        <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
                                            {updateTagMutation.error.message}
                                        </div>
                                    ) : null}

                                    {deleteTagMutation.error instanceof
                                    Error ? (
                                        <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
                                            {deleteTagMutation.error.message}
                                        </div>
                                    ) : null}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {effectiveBoards.map((board) => (
                            <div
                                key={board.key}
                                className={cn(
                                    'flex h-7 items-center gap-1 rounded-md pl-3 pr-1 text-xs font-medium tracking-[0.02em] transition-colors',
                                    activeBoardId === board.id ||
                                        activeBoardId === board.name
                                        ? 'bg-sidebar-accent text-sidebar-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveBoardId(board.id)}
                                    className="cursor-pointer"
                                >
                                    <span>{board.name}</span>
                                </button>
                                {activeBoardId === board.id ||
                                activeBoardId === board.name ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="cursor-pointer rounded-sm p-0.5 text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                                                aria-label="Действия с таблицей"
                                            >
                                                <EllipsisVertical className="size-4" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="end"
                                            className="w-52 border-sidebar-border bg-sidebar p-2 text-sidebar-foreground"
                                        >
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start text-destructive hover:bg-sidebar-accent hover:text-destructive disabled:opacity-40"
                                                disabled={
                                                    effectiveBoards.length === 1
                                                }
                                                onClick={() =>
                                                    handleDeleteBoard(board.id)
                                                }
                                            >
                                                Удалить таблицу
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                ) : null}
                            </div>
                        ))}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                    aria-label="Создать таблицу"
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-72 border-sidebar-border bg-sidebar p-3 text-sidebar-foreground"
                            >
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium">
                                            Новая таблица
                                        </div>
                                        <div className="mt-1 text-xs text-sidebar-foreground/60">
                                            Добавьте новую таблицу в текущий
                                            проект.
                                        </div>
                                    </div>
                                    <Input
                                        value={newBoardName}
                                        onChange={(event) =>
                                            setNewBoardName(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                handleCreateBoard();
                                            }
                                        }}
                                        placeholder="Например, SUPPORT"
                                        uiSize="md"
                                        className="border-sidebar-border bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/45"
                                    />
                                    {hasDuplicateBoardName ? (
                                        <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
                                            Таблица с таким именем уже
                                            существует в проекте.
                                        </div>
                                    ) : null}
                                    {createBoardMutation.error instanceof
                                    Error ? (
                                        <div className="rounded-md border border-destructive/30 px-3 py-2 text-xs text-destructive">
                                            {createBoardMutation.error.message}
                                        </div>
                                    ) : null}
                                    <Button
                                        type="button"
                                        className="w-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
                                        onClick={handleCreateBoard}
                                        disabled={
                                            !newBoardName.trim() ||
                                            hasDuplicateBoardName
                                        }
                                    >
                                        Создать таблицу
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {children}
            </div>
        </header>
    );
};

export default Header;
