'use client';

import React, { useEffect, useState } from 'react';
import { EllipsisVertical, Plus } from 'lucide-react';

import {
    cn,
    projectTabs,
    type ProjectSummary,
    type ProjectTab,
    useActiveProject,
} from '@/shared/lib';
import {
    Avatar,
    Badge,
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
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
    const { activeBoardId, setActiveBoardId, setProjects, updateProject } =
        useActiveProject();
    const [projectTab, setProjectTab] = useState<ProjectTab>('Задачи');
    const [newBoardName, setNewBoardName] = useState('');

    useEffect(() => {
        if (!project.boardTabs.includes(activeBoardId)) {
            setActiveBoardId(project.boardTabs[0]);
        }
    }, [activeBoardId, project.boardTabs, setActiveBoardId]);

    const activeProjectTab = controlledProjectTab ?? projectTab;

    const handleProjectTabChange = (tab: ProjectTab) => {
        onProjectTabChange?.(tab);

        if (controlledProjectTab === undefined) {
            setProjectTab(tab);
        }
    };

    const handleCreateBoard = () => {
        const trimmedName = newBoardName.trim();

        if (!trimmedName) {
            return;
        }

        setProjects((currentProjects) =>
            currentProjects.map((currentProject) =>
                currentProject.id === project.id
                    ? {
                          ...currentProject,
                          boardTabs: [
                              ...currentProject.boardTabs,
                              trimmedName.toUpperCase(),
                          ],
                      }
                    : currentProject,
            ),
        );
        setActiveBoardId(trimmedName.toUpperCase());
        setNewBoardName('');
    };

    const handleDeleteBoard = (boardName: string) => {
        if (project.boardTabs.length === 1) {
            return;
        }

        const remainingBoards = project.boardTabs.filter(
            (tab) => tab !== boardName,
        );

        setProjects((currentProjects) =>
            currentProjects.map((currentProject) =>
                currentProject.id === project.id
                    ? {
                          ...currentProject,
                          boardTabs: remainingBoards,
                      }
                    : currentProject,
            ),
        );

        if (activeBoardId === boardName) {
            setActiveBoardId(remainingBoards[0]);
        }
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
                        <Avatar
                            size="md"
                            shape="soft"
                            className={project.avatarClassName}
                        >
                            {project.avatar}
                        </Avatar>
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
                        {project.boardTabs.map((tab) => (
                            <div
                                key={tab}
                                className={cn(
                                    'flex h-7 items-center gap-1 rounded-md pl-3 pr-1 text-xs font-medium tracking-[0.02em] transition-colors',
                                    activeBoardId === tab
                                        ? 'bg-sidebar-accent text-sidebar-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveBoardId(tab)}
                                    className="cursor-pointer"
                                >
                                    <span>{tab}</span>
                                </button>
                                {activeBoardId === tab ? (
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
                                                    project.boardTabs.length ===
                                                    1
                                                }
                                                onClick={() =>
                                                    handleDeleteBoard(tab)
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
                                    <Button
                                        type="button"
                                        className="w-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
                                        onClick={handleCreateBoard}
                                        disabled={!newBoardName.trim()}
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
