'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/react';
import { GripVertical } from 'lucide-react';
import { cn, type ProjectSummary } from '@/shared/lib';
import { ProjectAvatar } from '@/shared/ui';
import { SidebarMenuButton } from '@/shared/ui/sidebar';
import { getSidebarProjectDragId } from './sidebar-project-dnd';

type SidebarProjectLinkProps = {
    project: ProjectSummary;
    activeProjectId: string;
    pathname: string;
    itemClassName: string;
    nested?: boolean;
    onProjectSelect: (projectId: string) => void;
};

export function SidebarProjectLink({
    project,
    activeProjectId,
    pathname,
    itemClassName,
    nested = false,
    onProjectSelect,
}: SidebarProjectLinkProps) {
    const { ref, handleRef, isDragging } = useDraggable({
        id: getSidebarProjectDragId(project.id),
    });

    return (
        <div
            ref={ref}
            className={cn('group/project relative', isDragging && 'opacity-55')}
        >
            <SidebarMenuButton
                asChild
                tooltip={project.name}
                isActive={pathname === '/' && activeProjectId === project.id}
                className={cn(itemClassName, nested && 'h-9 pr-3 pl-2')}
            >
                <Link href="/" onClick={() => onProjectSelect(project.id)}>
                    <span
                        ref={handleRef}
                        aria-hidden="true"
                        className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-sidebar-foreground/0 transition-colors group-hover/project:text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-foreground/75 active:cursor-grabbing group-data-[collapsible=icon]:hidden"
                    >
                        <GripVertical className="size-3.5" />
                    </span>
                    <ProjectAvatar
                        size="xs"
                        shape="square"
                        className={cn(project.avatarClassName)}
                        imageUrl={project.imageUrl}
                        fallback={project.avatar}
                        alt={project.name}
                    />
                    <span className="truncate">{project.name}</span>
                </Link>
            </SidebarMenuButton>
        </div>
    );
}
