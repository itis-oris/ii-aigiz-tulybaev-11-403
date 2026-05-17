'use client';

import React, { useMemo, useState } from 'react';
import { useActiveProject, useProjectTab } from '@/shared/lib';
import type { DateRange } from '@/shared/ui';
import {
    organizationTaskDays,
    type DayTasks,
    type Task,
} from '@/views/home/model/task';
import { TaskSheet } from '@/views/home/ui/task-sheet';
import { Header } from '@/views/home/ui/home-header';
import { Board, MonthBoard, TasksBoard } from '@/views/home/ui/board';
import type { ViewMode } from '@/views/home/ui/home-header/view-mode';
import type { SortMode } from '@/views/home/ui/home-header/sort-mode';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';
import { Overview } from '@/views/home/ui/overview';

type HomePageProps = {
    scope?: 'project' | 'organization';
};

const shortDayMonthFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
});
const fullDayFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});
const monthTitleFormatter = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
});
const weekDayTitleFormatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
});
const boardDayFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
});

const normalizeDate = (value: string) => {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

const startOfWeek = (date: Date) => {
    const nextDate = new Date(date);
    const day = nextDate.getDay();
    const offset = day === 0 ? 6 : day - 1;
    nextDate.setDate(nextDate.getDate() - offset);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate;
};

const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
};

const addMonths = (date: Date, months: number) =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);

const isSameOrAfter = (left: Date, right: Date) =>
    left.getTime() >= right.getTime();

const isSameOrBefore = (left: Date, right: Date) =>
    left.getTime() <= right.getTime();

const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

const getInitialAnchorDate = (tasks: Task[]) => {
    const datedTasks = tasks
        .map((task) => (task.dueDate ? normalizeDate(task.dueDate) : null))
        .filter((date): date is Date => date !== null)
        .sort((left, right) => left.getTime() - right.getTime());

    return datedTasks[0] ?? new Date();
};

const getInitialRange = (tasks: Task[]): DateRange => {
    const anchorDate = getInitialAnchorDate(tasks);

    return {
        from: startOfMonth(anchorDate),
        to: endOfMonth(anchorDate),
    };
};

const getResolvedRange = (range: DateRange | undefined, tasks: Task[]) => {
    const fallbackRange = getInitialRange(tasks);
    const from = range?.from ?? fallbackRange.from ?? new Date();
    const to = range?.to ?? from;

    return { from, to };
};

const sortTasks = (tasks: Task[], sortMode: SortMode) => {
    const sortedTasks = [...tasks];

    sortedTasks.sort((left, right) => {
        if (sortMode === 'По умолчанию') {
            return (
                Number(left.position ?? 0) - Number(right.position ?? 0) ||
                left.id - right.id
            );
        }

        if (sortMode === 'Дедлайн ближе') {
            return (
                (normalizeDate(left.dueDate ?? '')?.getTime() ??
                    Number.MAX_SAFE_INTEGER) -
                (normalizeDate(right.dueDate ?? '')?.getTime() ??
                    Number.MAX_SAFE_INTEGER)
            );
        }

        if (sortMode === 'Дедлайн дальше') {
            return (
                (normalizeDate(right.dueDate ?? '')?.getTime() ??
                    Number.MIN_SAFE_INTEGER) -
                (normalizeDate(left.dueDate ?? '')?.getTime() ??
                    Number.MIN_SAFE_INTEGER)
            );
        }

        if (sortMode === 'Приоритет выше') {
            return (
                (left.priority ?? Number.MAX_SAFE_INTEGER) -
                (right.priority ?? Number.MAX_SAFE_INTEGER)
            );
        }

        return left.title.localeCompare(right.title, 'ru-RU');
    });

    return sortedTasks;
};

const HomePage = ({ scope = 'project' }: HomePageProps) => {
    const { activeProjectTab } = useProjectTab();
    const { activeBoardId, activeProjectId, projects } = useActiveProject();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [customTasks, setCustomTasks] = useState<Task[]>([]);
    const [activeViewMode, setActiveViewMode] = useState<ViewMode>('Неделя');
    const [activeSortMode, setActiveSortMode] =
        useState<SortMode>('По умолчанию');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [headerSettings, setHeaderSettings] =
        useState<HomeHeaderSettingsValue>({
            density: 'standard',
            showProjectName: true,
            showTaskCounters: true,
        });
    const isOrganizationScope = scope === 'organization';
    const [organizationProjectFilter, setOrganizationProjectFilter] =
        useState<string>('all');
    const filteredDays = useMemo<DayTasks[]>(() => {
        if (isOrganizationScope) {
            if (organizationProjectFilter === 'all') {
                return organizationTaskDays;
            }

            return organizationTaskDays.map((day) => ({
                ...day,
                tasks: day.tasks.filter(
                    (task) => task.projectSlug === organizationProjectFilter,
                ),
            }));
        }

        return organizationTaskDays.map((day) => ({
            ...day,
            tasks: day.tasks.filter(
                (task) => task.projectSlug === activeProjectId,
            ),
        }));
    }, [activeProjectId, isOrganizationScope, organizationProjectFilter]);
    const allTasks = useMemo(
        () =>
            [
                ...filteredDays.flatMap((day) => day.tasks),
                ...customTasks,
            ].filter((task) =>
                isOrganizationScope ? true : task.boardId === activeBoardId,
            ),
        [activeBoardId, customTasks, filteredDays, isOrganizationScope],
    );
    const filteredTasks = useMemo(
        () =>
            allTasks.filter((task) => {
                const matchesSearch = searchQuery.trim()
                    ? task.title
                          .toLowerCase()
                          .includes(searchQuery.trim().toLowerCase())
                    : true;
                const matchesStatus =
                    selectedStatus === 'all'
                        ? true
                        : task.status === selectedStatus;
                const matchesTag =
                    selectedTag === 'all'
                        ? true
                        : task.tags.includes(selectedTag);

                return matchesSearch && matchesStatus && matchesTag;
            }),
        [allTasks, searchQuery, selectedStatus, selectedTag],
    );
    const statusOptions = useMemo(
        () => [...new Set(allTasks.map((task) => task.status))].sort(),
        [allTasks],
    );
    const tagOptions = useMemo(
        () => [...new Set(allTasks.flatMap((task) => task.tags))].sort(),
        [allTasks],
    );
    const [anchorDate, setAnchorDate] = useState<Date>(() =>
        getInitialAnchorDate(filteredTasks),
    );
    const [selectedRange, setSelectedRange] = useState<DateRange>(() =>
        getInitialRange(filteredTasks),
    );
    const sortedTasks = useMemo(
        () => sortTasks(filteredTasks, activeSortMode),
        [activeSortMode, filteredTasks],
    );
    const periodTasks = useMemo(() => {
        if (activeViewMode === 'Неделя') {
            const weekStart = startOfWeek(anchorDate);
            const weekEnd = addDays(weekStart, 6);

            return sortedTasks.filter((task) => {
                const dueDate = task.dueDate
                    ? normalizeDate(task.dueDate)
                    : null;

                return (
                    dueDate !== null &&
                    isSameOrAfter(dueDate, weekStart) &&
                    isSameOrBefore(dueDate, weekEnd)
                );
            });
        }

        if (activeViewMode === 'Доски') {
            const rangeStart = selectedRange.from;
            const rangeEnd = selectedRange.to ?? selectedRange.from;

            return sortedTasks.filter((task) => {
                const dueDate = task.dueDate
                    ? normalizeDate(task.dueDate)
                    : null;

                return (
                    dueDate !== null &&
                    rangeStart !== undefined &&
                    isSameOrAfter(dueDate, rangeStart) &&
                    rangeEnd !== undefined &&
                    isSameOrBefore(dueDate, rangeEnd)
                );
            });
        }

        const monthStart = startOfMonth(anchorDate);
        const monthEnd = endOfMonth(anchorDate);

        return sortedTasks.filter((task) => {
            const dueDate = task.dueDate ? normalizeDate(task.dueDate) : null;

            return (
                dueDate !== null &&
                isSameOrAfter(dueDate, monthStart) &&
                isSameOrBefore(dueDate, monthEnd)
            );
        });
    }, [
        activeViewMode,
        anchorDate,
        selectedRange.from,
        selectedRange.to,
        sortedTasks,
    ]);
    const days = useMemo<DayTasks[]>(() => {
        const weekStart = startOfWeek(anchorDate);

        return Array.from({ length: 7 }, (_, index) => {
            const date = addDays(weekStart, index);
            const columnId = date.toISOString().slice(0, 10);
            const dayTasks = periodTasks
                .filter((task) => {
                    const dueDate = task.dueDate
                        ? normalizeDate(task.dueDate)
                        : null;

                    return (
                        dueDate !== null &&
                        dueDate.toISOString().slice(0, 10) === columnId
                    );
                })
                .map((task, taskIndex) => ({
                    ...task,
                    columnId,
                    position: String((taskIndex + 1) * 1000),
                }));

            return {
                day: capitalize(weekDayTitleFormatter.format(date)),
                date: boardDayFormatter.format(date),
                columnId,
                tasks: dayTasks,
            };
        });
    }, [anchorDate, periodTasks]);
    const totalTasks = useMemo(() => periodTasks.length, [periodTasks]);
    const boardTasks = useMemo(() => periodTasks, [periodTasks]);
    const periodInfo = useMemo(() => {
        if (activeViewMode === 'Неделя') {
            const weekStart = startOfWeek(anchorDate);
            const weekEnd = addDays(weekStart, 6);

            return {
                title: `${shortDayMonthFormatter.format(weekStart)} - ${shortDayMonthFormatter.format(weekEnd)}`,
                subtitle: `${fullDayFormatter.format(weekStart)} - ${fullDayFormatter.format(weekEnd)}`,
            };
        }

        if (activeViewMode === 'Доски') {
            const rangeStart = selectedRange.from;
            const rangeEnd = selectedRange.to ?? selectedRange.from;

            if (!rangeStart || !rangeEnd) {
                return {
                    title: 'Диапазон не выбран',
                    subtitle: 'Выберите даты в календаре',
                };
            }

            return {
                title: `${shortDayMonthFormatter.format(rangeStart)} - ${shortDayMonthFormatter.format(rangeEnd)}`,
                subtitle: `${fullDayFormatter.format(rangeStart)} - ${fullDayFormatter.format(rangeEnd)}`,
            };
        }

        const monthStart = startOfMonth(anchorDate);
        const monthEnd = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth() + 1,
            0,
        );

        return {
            title: capitalize(monthTitleFormatter.format(monthStart)),
            subtitle: `${fullDayFormatter.format(monthStart)} - ${fullDayFormatter.format(monthEnd)}`,
        };
    }, [activeViewMode, anchorDate, selectedRange.from, selectedRange.to]);

    React.useEffect(() => {
        setAnchorDate(getInitialAnchorDate(allTasks));
        setSelectedRange(getInitialRange(allTasks));
    }, [
        activeProjectId,
        allTasks,
        allTasks.length,
        isOrganizationScope,
        organizationProjectFilter,
    ]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedStatus('all');
        setSelectedTag('all');
    };

    const handlePreviousPeriod = () => {
        if (activeViewMode === 'Доски') {
            setSelectedRange((currentRange) => {
                const { from: fromDate, to: toDate } = getResolvedRange(
                    currentRange,
                    allTasks,
                );
                const rangeLength = Math.max(
                    1,
                    Math.round(
                        (toDate.getTime() - fromDate.getTime()) /
                            (24 * 60 * 60 * 1000),
                    ) + 1,
                );

                return {
                    from: addDays(fromDate, -rangeLength),
                    to: addDays(toDate, -rangeLength),
                };
            });
            return;
        }

        setAnchorDate((currentDate) =>
            activeViewMode === 'Неделя'
                ? addDays(currentDate, -7)
                : addMonths(currentDate, -1),
        );
    };

    const handleNextPeriod = () => {
        if (activeViewMode === 'Доски') {
            setSelectedRange((currentRange) => {
                const { from: fromDate, to: toDate } = getResolvedRange(
                    currentRange,
                    allTasks,
                );
                const rangeLength = Math.max(
                    1,
                    Math.round(
                        (toDate.getTime() - fromDate.getTime()) /
                            (24 * 60 * 60 * 1000),
                    ) + 1,
                );

                return {
                    from: addDays(fromDate, rangeLength),
                    to: addDays(toDate, rangeLength),
                };
            });
            return;
        }

        setAnchorDate((currentDate) =>
            activeViewMode === 'Неделя'
                ? addDays(currentDate, 7)
                : addMonths(currentDate, 1),
        );
    };

    const handleResetPeriod = () => {
        if (activeViewMode === 'Доски') {
            setSelectedRange(getInitialRange(allTasks));
            return;
        }

        setAnchorDate(getInitialAnchorDate(allTasks));
    };

    const createTask = (
        title: string,
        overrides: Partial<Task> &
            Pick<Task, 'columnId' | 'project' | 'projectSlug'>,
    ) => {
        const dueDate =
            overrides.dueDate ?? `${overrides.columnId}T09:00:00.000Z`;
        const dueDateValue = normalizeDate(dueDate);
        const nextId =
            Math.max(
                0,
                ...organizationTaskDays.flatMap((day) =>
                    day.tasks.map((task) => task.id),
                ),
                ...customTasks.map((task) => task.id),
            ) + 1;

        setCustomTasks((currentTasks) => [
            ...currentTasks,
            {
                id: nextId,
                title,
                columnId: overrides.columnId,
                position: overrides.position ?? '1000',
                project: overrides.project,
                projectSlug: overrides.projectSlug,
                boardId: overrides.boardId ?? activeBoardId,
                dueDate,
                dueInDays:
                    dueDateValue === null
                        ? 0
                        : Math.max(
                              0,
                              Math.ceil(
                                  (dueDateValue.getTime() - Date.now()) /
                                      (24 * 60 * 60 * 1000),
                              ),
                          ),
                status: overrides.status ?? 'todo',
                tags: overrides.tags ?? ['new'],
                priority: overrides.priority ?? 3,
                description: overrides.description,
                projectId: overrides.projectId,
                assigneeId: overrides.assigneeId,
                storyPoints: overrides.storyPoints,
            },
        ]);
    };

    const handleCreateWeeklyTask = (columnId: string, title: string) => {
        const visibleProject = projects.find(
            (project) => project.id === activeProjectId,
        );

        createTask(title, {
            columnId,
            dueDate: `${columnId}T09:00:00.000Z`,
            boardId: activeBoardId,
            project: visibleProject?.name ?? 'Project',
            projectSlug: activeProjectId,
            status: 'todo',
            tags: ['new'],
        });
    };

    const handleCreateBoardTask = (columnId: string, title: string) => {
        const visibleProject = projects.find(
            (project) => project.id === activeProjectId,
        );
        const monthAnchor = startOfMonth(anchorDate);
        const dueDate = `${monthAnchor.toISOString().slice(0, 10)}T09:00:00.000Z`;

        createTask(title, {
            columnId,
            dueDate,
            boardId: activeBoardId,
            project: visibleProject?.name ?? 'Project',
            projectSlug: activeProjectId,
            status:
                columnId === 'todo' ||
                columnId === 'in progress' ||
                columnId === 'review'
                    ? columnId
                    : 'todo',
            tags: ['new'],
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
            {!isOrganizationScope && activeProjectTab === 'Обзор' ? (
                <Overview />
            ) : (
                <>
                    <div className="shrink-0 border-b border-border bg-background px-3 py-2">
                        {isOrganizationScope ? (
                            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1 pt-1">
                                <div>
                                    <h1 className="text-xl font-semibold text-foreground">
                                        Все задачи
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Задачи из всех проектов организации в
                                        одном представлении.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                                    {totalTasks} задач
                                </div>
                            </div>
                        ) : null}
                        <Header
                            activeViewMode={activeViewMode}
                            onViewModeChange={setActiveViewMode}
                            activeSortMode={activeSortMode}
                            onSortModeChange={setActiveSortMode}
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            selectedStatus={selectedStatus}
                            onSelectedStatusChange={setSelectedStatus}
                            selectedTag={selectedTag}
                            onSelectedTagChange={setSelectedTag}
                            statusOptions={statusOptions}
                            tagOptions={tagOptions}
                            onResetFilters={handleResetFilters}
                            projectOptions={
                                isOrganizationScope ? projects : undefined
                            }
                            selectedProjectId={
                                isOrganizationScope
                                    ? organizationProjectFilter
                                    : undefined
                            }
                            onProjectChange={
                                isOrganizationScope
                                    ? setOrganizationProjectFilter
                                    : undefined
                            }
                            periodTitle={periodInfo.title}
                            periodSubtitle={periodInfo.subtitle}
                            selectedDate={anchorDate}
                            selectedRange={selectedRange}
                            onSelectedDateChange={(date) => {
                                if (date) {
                                    if (activeViewMode === 'Месяц') {
                                        setAnchorDate(startOfMonth(date));
                                        return;
                                    }

                                    setAnchorDate(date);
                                }
                            }}
                            onSelectedRangeChange={(range) => {
                                if (range?.from) {
                                    setSelectedRange({
                                        from: range.from,
                                        to: range.to ?? range.from,
                                    });
                                } else {
                                    setSelectedRange(getInitialRange(allTasks));
                                }
                            }}
                            onPreviousPeriod={handlePreviousPeriod}
                            onNextPeriod={handleNextPeriod}
                            onResetPeriod={handleResetPeriod}
                            settings={headerSettings}
                            onSettingsChange={setHeaderSettings}
                        />
                    </div>
                    {activeViewMode === 'Доски' ? (
                        <TasksBoard
                            tasks={boardTasks}
                            setIsOpen={setIsOpen}
                            setSelectedTask={setSelectedTask}
                            onCreateTask={handleCreateBoardTask}
                            settings={headerSettings}
                        />
                    ) : activeViewMode === 'Месяц' ? (
                        <MonthBoard
                            tasks={boardTasks}
                            anchorDate={anchorDate}
                            setIsOpen={setIsOpen}
                            setSelectedTask={setSelectedTask}
                            settings={headerSettings}
                        />
                    ) : (
                        <Board
                            days={days}
                            setIsOpen={setIsOpen}
                            setSelectedTask={setSelectedTask}
                            onCreateTask={handleCreateWeeklyTask}
                            settings={headerSettings}
                        />
                    )}
                    <TaskSheet
                        isOpen={isOpen}
                        selectedTask={selectedTask}
                        setIsOpen={setIsOpen}
                        setSelectedTask={setSelectedTask}
                    />
                </>
            )}
        </div>
    );
};

export default HomePage;
