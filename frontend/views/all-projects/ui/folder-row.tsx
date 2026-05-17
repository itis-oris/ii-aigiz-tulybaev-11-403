'use client';

import { useDroppable } from '@dnd-kit/react';
import { ChevronRight, EllipsisVertical, Folder } from 'lucide-react';
import { cn, type ProjectFolder } from '@/shared/lib';
import {
    Avatar,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui';
import { getAllProjectsFolderDropId } from './all-projects-dnd';

const folderDateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
});

const folderOwnerPalette = [
    'bg-slate-100 text-slate-600',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

const folderAvatarPalette = [
    'bg-slate-100 text-slate-600',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

const getOwnerInitials = (ownerName: string) =>
    ownerName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || 'PR';

const getOwnerClassName = (seed: string) => {
    const hash = [...seed].reduce(
        (accumulator, char) => accumulator + char.charCodeAt(0),
        0,
    );

    return folderOwnerPalette[hash % folderOwnerPalette.length];
};

const getFolderAvatarClassName = (folderId: string) => {
    const hash = [...folderId].reduce(
        (accumulator, char) => accumulator + char.charCodeAt(0),
        0,
    );

    return folderAvatarPalette[hash % folderAvatarPalette.length];
};

const getDateLabel = (createdAt?: string) => {
    if (!createdAt) {
        return '-';
    }

    const parsedDate = new Date(createdAt);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return folderDateFormatter.format(parsedDate);
};

type FolderRowProps = {
    folder: ProjectFolder;
    childrenCount: number;
    isCollapsed: boolean;
    onToggle: () => void;
    onManageFolder: (folder: ProjectFolder) => void;
};

export function FolderRow({
    folder,
    childrenCount,
    isCollapsed,
    onToggle,
    onManageFolder,
}: FolderRowProps) {
    const { ref, isDropTarget } = useDroppable({
        id: getAllProjectsFolderDropId(folder.id),
    });
    const ownerName = folder.ownerName || folder.ownerEmail || 'Без владельца';
    const ownerSeed = folder.ownerId ?? folder.ownerEmail ?? ownerName;

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
                    className={getFolderAvatarClassName(folder.id)}
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="ml-auto rounded-md text-muted-foreground"
                            aria-label={`Действия с папкой ${folder.name}`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <EllipsisVertical className="size-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => onManageFolder(folder)}
                        >
                            Настройки папки
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground">
                <span className="size-2 rounded-full bg-primary/70" />
                <span>Папка</span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
                {getDateLabel(folder.createdAt)}
            </div>

            <div className="flex min-w-0 items-center gap-3">
                <Avatar size="sm" className={getOwnerClassName(ownerSeed)}>
                    {getOwnerInitials(ownerName)}
                </Avatar>
                <span className="truncate text-sm text-muted-foreground">
                    {ownerName}
                </span>
            </div>
        </div>
    );
}
