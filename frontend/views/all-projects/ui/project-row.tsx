'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/react';
import { EllipsisVertical, GripVertical } from 'lucide-react';
import { cn, type ProjectSummary } from '@/shared/lib';
import {
    Avatar,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui';
import { getAllProjectsProjectDragId } from './all-projects-dnd';
import type { ProjectListItem } from './project-list-item';

type ProjectRowProps = {
    project: ProjectListItem;
    activeProjectId: string;
    setActiveProjectId: (projectId: string) => void;
    onManageProject: (project: ProjectSummary) => void;
    className?: string;
};

export function ProjectRow({
    project,
    activeProjectId,
    setActiveProjectId,
    onManageProject,
    className,
}: ProjectRowProps) {
    const { ref, handleRef, isDragging } = useDraggable({
        id: getAllProjectsProjectDragId(project.id),
    });

    return (
        <div
            ref={ref}
            className={cn(
                'grid grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-4 border-b border-border px-3 py-2 transition-colors hover:bg-muted/30',
                isDragging && 'opacity-55',
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-3 pl-6">
                <button
                    ref={handleRef}
                    type="button"
                    aria-label={`Переместить проект ${project.name}`}
                    className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
                >
                    <GripVertical className="size-4" />
                </button>

                <Avatar
                    size="md"
                    shape="square"
                    className={project.avatarClassName}
                >
                    {project.avatar}
                </Avatar>

                <Link
                    href="/"
                    onClick={() => setActiveProjectId(project.id)}
                    className={cn(
                        'truncate text-sm text-foreground transition-colors hover:text-primary',
                        activeProjectId === project.id && 'font-medium',
                    )}
                >
                    {project.name}
                </Link>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="ml-auto rounded-md text-muted-foreground"
                            aria-label={`Действия с проектом ${project.name}`}
                        >
                            <EllipsisVertical className="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => onManageProject(project)}
                        >
                            Настройки проекта
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground">
                <span
                    className={cn(
                        'size-2 rounded-full',
                        project.status === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : project.status === 'ON_HOLD'
                              ? 'bg-slate-400'
                              : project.status === 'COMPLETED'
                                ? 'bg-sky-500'
                                : 'bg-amber-400',
                    )}
                />
                <span>{project.statusLabel}</span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
                {project.dateLabel}
            </div>

            <div className="flex min-w-0 items-center gap-3">
                <Avatar size="sm" className={project.ownerClassName}>
                    {project.ownerInitials}
                </Avatar>
                <span className="truncate text-sm text-muted-foreground">
                    {project.ownerName}
                </span>
            </div>
        </div>
    );
}
