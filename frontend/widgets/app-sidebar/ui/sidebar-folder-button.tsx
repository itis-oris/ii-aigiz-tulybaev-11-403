'use client';

import { useDroppable } from '@dnd-kit/react';
import { ChevronRight, Folder } from 'lucide-react';
import { cn, type ProjectFolder } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import { SidebarMenuButton } from '@/shared/ui/sidebar';
import { getSidebarFolderDropId } from './sidebar-project-dnd';

type SidebarFolderButtonProps = {
    folder: ProjectFolder;
    isCollapsed: boolean;
    itemClassName: string;
    onToggle: () => void;
};

export function SidebarFolderButton({
    folder,
    isCollapsed,
    itemClassName,
    onToggle,
}: SidebarFolderButtonProps) {
    const { ref, isDropTarget } = useDroppable({
        id: getSidebarFolderDropId(folder.id),
    });

    return (
        <SidebarMenuButton
            ref={ref}
            tooltip={folder.name}
            className={cn(
                itemClassName,
                isDropTarget && 'bg-sidebar-accent/80',
            )}
            onClick={onToggle}
        >
            <ChevronRight
                className={cn(
                    'size-3.5 shrink-0 text-sidebar-foreground/55 transition-transform',
                    !isCollapsed && 'rotate-90',
                )}
            />
            <Avatar
                size="xs"
                shape="square"
                className={cn(folder.avatarClassName)}
            >
                <Folder className="size-3.5" />
            </Avatar>
            <span>{folder.name}</span>
        </SidebarMenuButton>
    );
}
