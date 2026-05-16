'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Settings2, UserPlus } from 'lucide-react';
import { cn, type ProjectSummary } from '@/shared/lib';
import { Avatar, Button } from '@/shared/ui';

type WorkspaceSwitcherProps = {
    label: string;
    shortLabel: string;
    projects: ProjectSummary[];
    activeProjectId: string;
    onProjectSelect: (projectId: string) => void;
    onInviteClick: () => void;
};

export default function WorkspaceSwitcher({
    label,
    shortLabel,
    projects,
    activeProjectId,
    onProjectSelect,
    onInviteClick,
}: WorkspaceSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative min-w-0 flex-1">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-label="Открыть меню организации"
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
                <Avatar
                    size="sm"
                    shape="square"
                    className="bg-sidebar-accent text-sidebar-foreground"
                >
                    {shortLabel}
                </Avatar>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="truncate text-sm font-semibold text-sidebar-foreground">
                        {label}
                    </div>
                </div>
                <ChevronDown className="ml-auto size-4 text-sidebar-foreground/65 group-data-[collapsible=icon]:hidden" />
            </button>

            <div
                className={cn(
                    'absolute top-full left-0 z-40 mt-2 hidden w-[17.5rem] rounded-2xl border border-sidebar-border bg-sidebar p-3 shadow-lg',
                    'group-data-[collapsible=icon]:hidden',
                    isOpen && 'block',
                )}
            >
                <div className="flex items-start gap-3 rounded-xl px-1 pb-3">
                    <Avatar
                        size="md"
                        shape="square"
                        className="bg-sidebar-accent text-sidebar-foreground"
                    >
                        {shortLabel}
                    </Avatar>
                    <div className="min-w-0">
                        <div className="truncate text-[1.05rem] font-medium text-sidebar-foreground">
                            {label}
                        </div>
                        <div className="text-sm text-sidebar-foreground/55">
                            Супер-админ • {projects.length + 1} участник
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-sidebar-border bg-sidebar px-3 text-sm"
                    >
                        <Settings2 className="size-4" />
                        <span>Настройки</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-sidebar-border bg-sidebar px-3 text-sm"
                        onClick={() => {
                            setIsOpen(false);
                            onInviteClick();
                        }}
                    >
                        <UserPlus className="size-4" />
                        <span>Пригласить</span>
                    </Button>
                </div>

                <div className="border-t border-sidebar-border pt-3">
                    <div className="space-y-0.5">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            <Avatar
                                size="xs"
                                shape="square"
                                className="bg-sidebar-accent text-sidebar-foreground"
                            >
                                {shortLabel}
                            </Avatar>
                            <span className="truncate text-sm text-sidebar-foreground/75">
                                {label}
                            </span>
                        </button>

                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href="/"
                                onClick={() => {
                                    onProjectSelect(project.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent',
                                    activeProjectId === project.id &&
                                        'bg-sidebar-accent/70',
                                )}
                            >
                                <Avatar
                                    size="xs"
                                    shape="square"
                                    className={cn(project.avatarClassName)}
                                >
                                    {project.avatar}
                                </Avatar>
                                <span className="truncate text-sm text-sidebar-foreground">
                                    {project.name}
                                </span>
                            </Link>
                        ))}

                        <button
                            type="button"
                            className="w-full rounded-xl px-2 py-2 text-left text-sm text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            Новое пространство
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
