'use client';

import { useDroppable } from '@dnd-kit/react';
import { ChevronRight, Folder } from 'lucide-react';
import { cn, type ProjectFolder } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import { SidebarMenuButton } from '@/shared/ui/sidebar';
import { getSidebarFolderDropId } from './sidebar-project-dnd';

const folderPalette = [
    'bg-slate-100 text-slate-600',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

const getFolderClassName = (folderId: string) => {
    const hash = [...folderId].reduce(
        (accumulator, char) => accumulator + char.charCodeAt(0),
        0,
    );

    return folderPalette[hash % folderPalette.length];
};

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
                className={cn(getFolderClassName(folder.id))}
            >
                <Folder className="size-3.5" />
            </Avatar>
            <span>{folder.name}</span>
        </SidebarMenuButton>
    );
}
