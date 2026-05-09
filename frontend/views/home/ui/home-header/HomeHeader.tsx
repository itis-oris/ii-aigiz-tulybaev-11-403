import React, { useState } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    FunnelPlus,
    Settings2,
} from 'lucide-react';
import { Button } from '@/shared/ui';
import { viewModes } from '@/views/home/ui/home-header/view-mode';

const Header = () => {
    const [activeViewMode, setActiveViewMode] =
        useState<(typeof viewModes)[number]>('Неделя');

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <select
                        value={activeViewMode}
                        onChange={(event) =>
                            setActiveViewMode(
                                event.target
                                    .value as (typeof viewModes)[number],
                            )
                        }
                        className="h-8 cursor-pointer appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-ring"
                    >
                        {viewModes.map((mode) => (
                            <option key={mode} value={mode}>
                                {mode}
                            </option>
                        ))}
                    </select>
                    <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>

                <button className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <FunnelPlus className="size-4" />
                    Добавить фильтр
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    className="h-8 rounded-lg px-2.5 text-xs text-muted-foreground"
                >
                    <ChevronsUpDown className="size-4" />
                    По умолчанию
                </Button>

                <div className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-1.5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-md text-muted-foreground"
                        aria-label="Предыдущая дата"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-md text-muted-foreground"
                        aria-label="Календарь"
                    >
                        <CalendarDays className="size-3.5" />
                    </Button>
                    <div className="min-w-22 px-1.5 text-center">
                        <div className="text-xs font-medium leading-none">
                            01 мая
                        </div>
                        <div className="mt-0.5 text-[9px] leading-none text-muted-foreground">
                            01 мая 2026
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-md text-muted-foreground"
                        aria-label="Следующая дата"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground"
                    aria-label="Настройки"
                >
                    <Settings2 className="size-4" />
                </Button>
            </div>
        </div>
    );
};

export default Header;
