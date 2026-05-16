'use client';

import { useDroppable } from '@dnd-kit/react';
import { ChevronRight, Folder } from 'lucide-react';
import { cn, type ProjectFolder } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import { getAllProjectsFolderDropId } from './all-projects-dnd';

type FolderRowProps = {
    folder: ProjectFolder;
    childrenCount: number;
    isCollapsed: boolean;
    onToggle: () => void;
};

export function FolderRow({
    folder,
    childrenCount,
    isCollapsed,
    onToggle,
}: FolderRowProps) {
    const { ref, isDropTarget } = useDroppable({
        id: getAllProjectsFolderDropId(folder.id),
    });

    return (
        <div
            ref={ref}
            className={cn(
                'grid grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-4 rounded-xl bg-muted/50 px-3 py-3 transition-colors',
                isDropTarget &&
                    'bg-primary/8 ring-1 ring-inset ring-primary/30',
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    aria-label={
                        isCollapsed
                            ? `Развернуть папку ${folder.name}`
                            : `Свернуть папку ${folder.name}`
                    }
                    onClick={onToggle}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ChevronRight
                        className={cn(
                            'size-4 transition-transform',
                            !isCollapsed && 'rotate-90',
                        )}
                    />
                </button>
                <Avatar
                    size="md"
                    shape="square"
                    className={folder.avatarClassName}
                >
                    <Folder className="size-4" />
                </Avatar>
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                        {folder.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                        {childrenCount
                            ? `${childrenCount} проект${
                                  childrenCount === 1
                                      ? ''
                                      : childrenCount < 5
                                        ? 'а'
                                        : 'ов'
                              }`
                            : 'Перетащите проект сюда'}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="size-2 rounded-full bg-primary/70" />
                <span>Папка</span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
                {folder.dateLabel}
            </div>

            <div className="flex min-w-0 items-center gap-3">
                <Avatar size="sm" className={folder.ownerClassName}>
                    {folder.ownerInitials}
                </Avatar>
                <span className="truncate text-sm text-muted-foreground">
                    {folder.ownerName}
                </span>
            </div>
        </div>
    );
}
