import React, { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    FunnelPlus,
    Settings2,
} from 'lucide-react';
import {
    Button,
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui';
import type { ProjectSummary } from '@/shared/lib';
import {
    viewModes,
    type ViewMode,
} from '@/views/home/ui/home-header/view-mode';
import {
    sortModes,
    type SortMode,
} from '@/views/home/ui/home-header/sort-mode';

const startOfWeek = (date: Date) => {
    const nextDate = new Date(date);
    const day = nextDate.getDay();
    const offset = day === 0 ? 6 : day - 1;
    nextDate.setDate(nextDate.getDate() - offset);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate;
};

const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
};

const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

type HomeHeaderProps = {
    activeViewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
    projectOptions?: ProjectSummary[];
    selectedProjectId?: string;
    onProjectChange?: (projectId: string) => void;
    activeSortMode?: SortMode;
    onSortModeChange?: (mode: SortMode) => void;
    periodTitle: string;
    periodSubtitle: string;
    selectedDate: Date;
    onSelectedDateChange?: (date: Date | undefined) => void;
    selectedRange?: DateRange;
    onSelectedRangeChange?: (range: DateRange | undefined) => void;
    onPreviousPeriod?: () => void;
    onNextPeriod?: () => void;
    onResetPeriod?: () => void;
};

const Header = ({
    activeViewMode: controlledViewMode,
    onViewModeChange,
    projectOptions = [],
    selectedProjectId,
    onProjectChange,
    activeSortMode = 'По умолчанию',
    onSortModeChange,
    periodTitle,
    periodSubtitle,
    selectedDate,
    onSelectedDateChange,
    selectedRange,
    onSelectedRangeChange,
    onPreviousPeriod,
    onNextPeriod,
    onResetPeriod,
}: HomeHeaderProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('Неделя');
    const activeViewMode = controlledViewMode ?? viewMode;
    const weekRange =
        activeViewMode === 'Неделя'
            ? Array.from({ length: 7 }, (_, index) =>
                  addDays(startOfWeek(selectedDate), index),
              )
            : [];
    const monthRange =
        activeViewMode === 'Месяц'
            ? Array.from(
                  {
                      length: endOfMonth(selectedDate).getDate(),
                  },
                  (_, index) => addDays(startOfMonth(selectedDate), index),
              )
            : [];

    const handleViewModeChange = (nextViewMode: ViewMode) => {
        onViewModeChange?.(nextViewMode);

        if (controlledViewMode === undefined) {
            setViewMode(nextViewMode);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <select
                        value={activeViewMode}
                        onChange={(event) =>
                            handleViewModeChange(event.target.value as ViewMode)
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
                {projectOptions.length > 0 ? (
                    <div className="relative">
                        <select
                            value={selectedProjectId}
                            onChange={(event) =>
                                onProjectChange?.(event.target.value)
                            }
                            className="h-8 cursor-pointer appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-ring"
                        >
                            <option value="all">Все проекты</option>
                            {projectOptions.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <select
                        value={activeSortMode}
                        onChange={(event) =>
                            onSortModeChange?.(event.target.value as SortMode)
                        }
                        className="h-8 cursor-pointer appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-ring"
                    >
                        {sortModes.map((mode) => (
                            <option key={mode} value={mode}>
                                {mode}
                            </option>
                        ))}
                    </select>
                    <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-1.5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-md text-muted-foreground"
                        aria-label="Предыдущая дата"
                        onClick={onPreviousPeriod}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-6 rounded-md text-muted-foreground"
                                aria-label="Выбрать дату"
                            >
                                <CalendarDays className="size-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="center" className="w-auto p-0">
                            {activeViewMode === 'Доски' ? (
                                <Calendar
                                    mode="range"
                                    selected={selectedRange}
                                    onSelect={onSelectedRangeChange}
                                    defaultMonth={
                                        selectedRange?.from ?? selectedDate
                                    }
                                    numberOfMonths={2}
                                />
                            ) : (
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={onSelectedDateChange}
                                    defaultMonth={selectedDate}
                                    modifiers={{
                                        weekRange,
                                        weekRangeStart: weekRange[0]
                                            ? [weekRange[0]]
                                            : [],
                                        weekRangeEnd: weekRange[6]
                                            ? [weekRange[6]]
                                            : [],
                                        monthRange,
                                        monthRangeStart: monthRange[0]
                                            ? [monthRange[0]]
                                            : [],
                                        monthRangeEnd: monthRange.at(-1)
                                            ? [monthRange.at(-1)!]
                                            : [],
                                    }}
                                    modifiersClassNames={{
                                        weekRange:
                                            'bg-accent/35 text-accent-foreground [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground',
                                        weekRangeStart:
                                            'rounded-l-md bg-accent/55 text-accent-foreground [&>button]:rounded-l-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground',
                                        weekRangeEnd:
                                            'rounded-r-md bg-accent/55 text-accent-foreground [&>button]:rounded-r-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground',
                                        monthRange:
                                            activeViewMode === 'Месяц'
                                                ? 'bg-accent/35 text-accent-foreground [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground'
                                                : '',
                                        monthRangeStart:
                                            activeViewMode === 'Месяц'
                                                ? 'rounded-l-md bg-accent/55 text-accent-foreground [&>button]:rounded-l-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground'
                                                : '',
                                        monthRangeEnd:
                                            activeViewMode === 'Месяц'
                                                ? 'rounded-r-md bg-accent/55 text-accent-foreground [&>button]:rounded-r-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground'
                                                : '',
                                    }}
                                />
                            )}
                            <div className="border-t border-border p-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-center text-muted-foreground"
                                    onClick={onResetPeriod}
                                >
                                    Сбросить к текущему набору
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <div className="min-w-22 px-1.5 text-center">
                        <div className="text-xs font-medium leading-none">
                            {periodTitle}
                        </div>
                        <div className="mt-0.5 text-[9px] leading-none text-muted-foreground">
                            {periodSubtitle}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-md text-muted-foreground"
                        aria-label="Следующая дата"
                        onClick={onNextPeriod}
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
