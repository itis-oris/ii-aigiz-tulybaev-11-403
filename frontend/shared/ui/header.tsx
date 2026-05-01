'use client';

import React, { useState } from 'react';
import { EllipsisVertical } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

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

const boardTabs = ['DIGITAL', 'TRADE', 'OUTDOOR'];
const projectTabs = ['Обзор', 'Задачи'];

const Header = ({ className, children, ...props }: HeaderProps) => {
    const [activeBoard, setActiveBoard] = useState(boardTabs[0]);
    const [activeProjectTab, setActiveProjectTab] = useState(projectTabs[1]);

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
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
                            MB
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="truncate text-base font-semibold leading-none">
                                    Marlboro
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-sidebar-accent px-2 py-1 text-[10px] font-medium leading-none text-sidebar-foreground/80">
                                    <span className="size-1.5 rounded-full bg-green-500" />
                                    В работе
                                </span>
                            </div>
                            <div className="mt-1 truncate text-xs leading-none text-sidebar-foreground/60">
                                Проект
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {projectMembers.slice(0, 5).map((member, index) => (
                            <div
                                key={member.id}
                                title={member.name}
                                className={cn(
                                    'flex size-7 items-center justify-center rounded-full border-2 border-sidebar text-[9px] font-semibold',
                                    member.color,
                                    index > 0 && '-ml-2',
                                )}
                            >
                                {member.avatar}
                            </div>
                        ))}
                        <div className="-ml-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-sidebar bg-sidebar-accent px-1.5 text-[9px] font-semibold text-sidebar-foreground">
                            +2
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-lg bg-sidebar-accent/70 p-1">
                        {projectTabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveProjectTab(tab)}
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
                        {boardTabs.map((tab) => (
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
                    </div>
                </div>

                {children}
            </div>
        </header>
    );
};

export default Header;
