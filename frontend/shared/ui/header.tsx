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

const projectMembers = [
    {
        id: '1',
        name: 'Артем',
        avatar: 'AR',
        color: 'bg-amber-200 text-amber-900',
    },
    { id: '2', name: 'София', avatar: 'SO', color: 'bg-sky-200 text-sky-900' },
    {
        id: '3',
        name: 'Максим',
        avatar: 'MA',
        color: 'bg-lime-200 text-lime-900',
    },
    { id: '4', name: 'Анна', avatar: 'AN', color: 'bg-rose-200 text-rose-900' },
    {
        id: '5',
        name: 'Илья',
        avatar: 'IL',
        color: 'bg-violet-200 text-violet-900',
    },
];

type HeaderViewProps = HeaderProps & {
    project: ProjectSummary;
    activeProjectTab?: ProjectTab;
    onProjectTabChange?: (tab: ProjectTab) => void;
};

const Header = ({
    className,
    children,
    project,
    activeProjectTab: controlledProjectTab,
    onProjectTabChange,
    ...props
}: HeaderViewProps) => {
    const { setProjects } = useActiveProject();
    const [activeBoard, setActiveBoard] = useState(project.boardTabs[0]);
    const [projectTab, setProjectTab] = useState<ProjectTab>('Задачи');
    const [newBoardName, setNewBoardName] = useState('');

    useEffect(() => {
        setActiveBoard(project.boardTabs[0]);
    }, [project]);

    useEffect(() => {
        if (!project.boardTabs.includes(activeBoard)) {
            setActiveBoard(project.boardTabs[0]);
        }
    }, [activeBoard, project.boardTabs]);

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
        setActiveBoard(trimmedName.toUpperCase());
        setNewBoardName('');
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
                                <Badge
                                    size="sm"
                                    className="bg-sidebar-accent text-sidebar-foreground/80"
                                >
                                    <span className="size-1.5 rounded-full bg-green-500" />
                                    В работе
                                </Badge>
                            </div>
                            <div className="mt-1 truncate text-xs leading-none text-sidebar-foreground/60">
                                {project.description}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {projectMembers.slice(0, 5).map((member, index) => (
                            <Avatar
                                key={member.id}
                                title={member.name}
                                className={cn(
                                    'border-2 border-sidebar',
                                    member.color,
                                    index > 0 && '-ml-2',
                                )}
                            >
                                {member.avatar}
                            </Avatar>
                        ))}
                        {project.memberCount > 5 ? (
                            <Avatar className="-ml-2 min-w-7 border-2 border-sidebar bg-sidebar-accent px-1.5 text-sidebar-foreground">
                                +{project.memberCount - 5}
                            </Avatar>
                        ) : null}
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
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveBoard(tab)}
                                className={cn(
                                    'flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-medium tracking-[0.02em] transition-colors',
                                    activeBoard === tab
                                        ? 'bg-sidebar-accent text-sidebar-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                            >
                                <span>{tab}</span>
                                {activeBoard === tab && (
                                    <EllipsisVertical className="size-4" />
                                )}
                            </button>
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
