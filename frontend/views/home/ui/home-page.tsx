'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createTask,
    getBoards,
    getColumns,
    getTasks,
    moveTask,
    updateTask,
} from '@/shared/api';
import {
    useActiveProject,
    useProjectTab,
    type ProjectSummary,
} from '@/shared/lib';
import { Badge, type DateRange } from '@/shared/ui';
import {
    mapTaskResponseToTask,
    type DayTasks,
    type Task,
} from '@/views/home/model/task';
import { TaskSheet } from '@/views/home/ui/task-sheet';
import { Header } from '@/views/home/ui/home-header';
import { Board, MonthBoard, TasksBoard } from '@/views/home/ui/board';
import type { ViewMode } from '@/views/home/ui/home-header/view-mode';
import { sortModes } from '@/views/home/ui/home-header/sort-mode';
import type { SortMode } from '@/views/home/ui/home-header/sort-mode';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';
import { Overview } from '@/views/home/ui/overview';

type HomePageProps = {
    scope?: 'project' | 'organization';
};

const HOME_VIEW_MODE_STORAGE_KEY = 'home:view-mode';
const HOME_SORT_MODE_STORAGE_KEY = 'home:sort-mode';
const HOME_SEARCH_QUERY_STORAGE_KEY = 'home:search-query';
const HOME_SELECTED_STATUS_STORAGE_KEY = 'home:selected-status';
const HOME_SELECTED_TAG_STORAGE_KEY = 'home:selected-tag';

type HomePageContentProps = {
    activeBoardId: string;
    boardColumns: Array<{ id: string; name: string }>;
    createTaskError: string | null;
    canCreateTasks: boolean;
    isOrganizationScope: boolean;
    isCreatingTask: boolean;
    loading: boolean;
    projects: ProjectSummary[];
    selectedProjectId: string;
    sourceTasks: Task[];
    taskLoadError: string | null;
    onCreateBoardTask?: (columnId: string, title: string) => void;
    onCreateWeeklyTask?: (dateKey: string, title: string) => void;
    onMoveBoardTask?: (payload: {
        taskId: string;
        columnId: string;
        position: number;
    }) => void;
    onMoveScheduledTask?: (payload: {
        taskId: string;
        dueDate: string;
        position: number;
    }) => void;
    onSelectedProjectIdChange: (projectId: string) => void;
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

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const isViewMode = (value: string): value is ViewMode =>
    value === 'Неделя' || value === 'Доски' || value === 'Месяц';

const isSortMode = (value: string): value is SortMode =>
    sortModes.includes(value as SortMode);

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

const getTodayAnchorDate = () => new Date();

const getTodayRange = (): DateRange => {
    const today = getTodayAnchorDate();

    return {
        from: startOfMonth(today),
        to: endOfMonth(today),
    };
};

const getResolvedRange = (range: DateRange | undefined) => {
    const fallbackRange = getTodayRange();
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
                String(left.id).localeCompare(String(right.id), 'ru-RU')
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

const selectTasksForScope = ({
    activeBoardId,
    activeProjectId,
    isOrganizationScope,
    selectedProjectId,
    tasks,
}: {
    activeBoardId: string;
    activeProjectId: string;
    isOrganizationScope: boolean;
    selectedProjectId: string;
    tasks: Task[];
}) => {
    if (isOrganizationScope) {
        if (selectedProjectId === 'all') {
            return tasks;
        }

        return tasks.filter((task) => task.projectId === selectedProjectId);
    }

    const projectTasks = tasks.filter(
        (task) => task.projectId === activeProjectId,
    );

    if (!activeBoardId) {
        return projectTasks;
    }

    const boardTasks = projectTasks.filter(
        (task) =>
            task.boardId === activeBoardId || task.boardName === activeBoardId,
    );

    return boardTasks;
};

const HomePageContent = ({
    activeBoardId,
    boardColumns,
    createTaskError,
    canCreateTasks,
    isOrganizationScope,
    isCreatingTask,
    loading,
    projects,
    selectedProjectId,
    sourceTasks,
    taskLoadError,
    onCreateBoardTask,
    onCreateWeeklyTask,
    onMoveBoardTask,
    onMoveScheduledTask,
    onSelectedProjectIdChange,
}: HomePageContentProps) => {
    const canShowTaskCreate = !isOrganizationScope;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activeViewMode, setActiveViewMode] = useState<ViewMode>(() => {
        if (typeof window === 'undefined') {
            return 'Неделя';
        }

        const storedViewMode = window.localStorage.getItem(
            HOME_VIEW_MODE_STORAGE_KEY,
        );

        return storedViewMode && isViewMode(storedViewMode)
            ? storedViewMode
            : 'Неделя';
    });
    const [activeSortMode, setActiveSortMode] = useState<SortMode>(() => {
        if (typeof window === 'undefined') {
            return 'По умолчанию';
        }

        const storedSortMode = window.localStorage.getItem(
            HOME_SORT_MODE_STORAGE_KEY,
        );

        return storedSortMode && isSortMode(storedSortMode)
            ? storedSortMode
            : 'По умолчанию';
    });
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }

        return window.localStorage.getItem(HOME_SEARCH_QUERY_STORAGE_KEY) ?? '';
    });
    const [selectedStatus, setSelectedStatus] = useState(() => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        return (
            window.localStorage.getItem(HOME_SELECTED_STATUS_STORAGE_KEY) ??
            'all'
        );
    });
    const [selectedTag, setSelectedTag] = useState(() => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        return (
            window.localStorage.getItem(HOME_SELECTED_TAG_STORAGE_KEY) ?? 'all'
        );
    });
    const [headerSettings, setHeaderSettings] =
        useState<HomeHeaderSettingsValue>({
            density: 'standard',
            showProjectName: true,
            showTaskCounters: true,
        });

    const allTasks = useMemo(() => sourceTasks, [sourceTasks]);

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
                        : task.tags.some((tag) => tag.id === selectedTag);

                return matchesSearch && matchesStatus && matchesTag;
            }),
        [allTasks, searchQuery, selectedStatus, selectedTag],
    );

    const statusOptions = useMemo(
        () => [...new Set(allTasks.map((task) => task.status))].sort(),
        [allTasks],
    );
    const tagOptions = useMemo(() => {
        const tagMap = new Map<string, { label: string; value: string }>();

        allTasks.forEach((task) => {
            task.tags.forEach((tag) => {
                if (!tagMap.has(tag.id)) {
                    const label =
                        isOrganizationScope &&
                        selectedProjectId === 'all' &&
                        tag.projectName
                            ? `${tag.name} · ${tag.projectName}`
                            : tag.name;

                    tagMap.set(tag.id, {
                        label,
                        value: tag.id,
                    });
                }
            });
        });

        return [...tagMap.values()].sort((left, right) =>
            left.label.localeCompare(right.label, 'ru-RU'),
        );
    }, [allTasks, isOrganizationScope, selectedProjectId]);
    const [anchorDate, setAnchorDate] = useState<Date>(() =>
        getTodayAnchorDate(),
    );
    const [selectedRange, setSelectedRange] = useState<DateRange>(() =>
        getTodayRange(),
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
            const columnId = formatDateKey(date);
            const dayTasks = periodTasks
                .filter((task) => {
                    const dueDate = task.dueDate
                        ? normalizeDate(task.dueDate)
                        : null;

                    return (
                        dueDate !== null && formatDateKey(dueDate) === columnId
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

    useEffect(() => {
        window.localStorage.setItem(HOME_VIEW_MODE_STORAGE_KEY, activeViewMode);
    }, [activeViewMode]);

    useEffect(() => {
        window.localStorage.setItem(HOME_SORT_MODE_STORAGE_KEY, activeSortMode);
    }, [activeSortMode]);

    useEffect(() => {
        window.localStorage.setItem(HOME_SEARCH_QUERY_STORAGE_KEY, searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        window.localStorage.setItem(
            HOME_SELECTED_STATUS_STORAGE_KEY,
            selectedStatus,
        );
    }, [selectedStatus]);

    useEffect(() => {
        window.localStorage.setItem(HOME_SELECTED_TAG_STORAGE_KEY, selectedTag);
    }, [selectedTag]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedStatus('all');
        setSelectedTag('all');
    };

    const handlePreviousPeriod = () => {
        if (activeViewMode === 'Доски') {
            setSelectedRange((currentRange) => {
                const { from: fromDate, to: toDate } =
                    getResolvedRange(currentRange);
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
                const { from: fromDate, to: toDate } =
                    getResolvedRange(currentRange);
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
            setSelectedRange(getTodayRange());
            return;
        }

        setAnchorDate(getTodayAnchorDate());
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
            <div className="shrink-0 border-b border-border bg-background px-3 py-2">
                {isOrganizationScope ? (
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1 pt-1">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">
                                Все задачи
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Задачи из всех проектов организации в одном
                                представлении.
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                            {totalTasks} задач
                        </div>
                    </div>
                ) : null}

                {loading ? (
                    <div className="mb-3 px-1">
                        <Badge
                            variant="subtle"
                            className="bg-muted px-3 py-1.5"
                        >
                            Загрузка задач...
                        </Badge>
                    </div>
                ) : null}

                {taskLoadError ? (
                    <div className="mb-3 px-1">
                        <Badge
                            variant="outline"
                            className="border-destructive/30 px-3 py-1.5 text-destructive"
                        >
                            {taskLoadError}
                        </Badge>
                    </div>
                ) : null}

                {createTaskError ? (
                    <div className="mb-3 px-1">
                        <Badge
                            variant="outline"
                            className="border-destructive/30 px-3 py-1.5 text-destructive"
                        >
                            {createTaskError}
                        </Badge>
                    </div>
                ) : null}

                {isCreatingTask ? (
                    <div className="mb-3 px-1">
                        <Badge
                            variant="subtle"
                            className="bg-muted px-3 py-1.5"
                        >
                            Создание задачи...
                        </Badge>
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
                    projectOptions={isOrganizationScope ? projects : undefined}
                    selectedProjectId={
                        isOrganizationScope ? selectedProjectId : undefined
                    }
                    onProjectChange={
                        isOrganizationScope
                            ? onSelectedProjectIdChange
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
                            setSelectedRange(getTodayRange());
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
                    columns={boardColumns}
                    onCreateTask={
                        canShowTaskCreate ? onCreateBoardTask : undefined
                    }
                    onMoveTask={canCreateTasks ? onMoveBoardTask : undefined}
                    settings={headerSettings}
                />
            ) : activeViewMode === 'Месяц' ? (
                <MonthBoard
                    tasks={boardTasks}
                    anchorDate={anchorDate}
                    setIsOpen={setIsOpen}
                    setSelectedTask={setSelectedTask}
                    onMoveTask={onMoveScheduledTask}
                    settings={headerSettings}
                />
            ) : (
                <Board
                    days={days}
                    setIsOpen={setIsOpen}
                    setSelectedTask={setSelectedTask}
                    onCreateTask={
                        canShowTaskCreate ? onCreateWeeklyTask : undefined
                    }
                    onMoveTask={
                        onMoveScheduledTask
                            ? ({ taskId, columnId, position }) =>
                                  onMoveScheduledTask({
                                      taskId,
                                      dueDate: `${columnId}T09:00:00.000Z`,
                                      position,
                                  })
                            : undefined
                    }
                    dragEnabled
                    settings={headerSettings}
                />
            )}
            <TaskSheet
                isOpen={isOpen}
                selectedTask={selectedTask}
                setIsOpen={setIsOpen}
                setSelectedTask={setSelectedTask}
            />
        </div>
    );
};

const HomePage = ({ scope = 'project' }: HomePageProps) => {
    const queryClient = useQueryClient();
    const { activeProjectTab } = useProjectTab();
    const { activeBoardId, activeProjectId, projects } = useActiveProject();
    const isOrganizationScope = scope === 'organization';
    const [organizationProjectFilter, setOrganizationProjectFilter] =
        useState<string>('all');
    const [taskActionError, setTaskActionError] = useState<string | null>(null);

    const tasksQuery = useQuery({
        queryKey: ['tasks', 'all'],
        queryFn: () => getTasks(),
    });
    const boardsQuery = useQuery({
        queryKey: ['boards', activeProjectId],
        queryFn: () => getBoards(activeProjectId),
        enabled: !isOrganizationScope && Boolean(activeProjectId),
    });

    const activeBoard = useMemo(
        () =>
            (boardsQuery.data ?? []).find(
                (board) =>
                    board.id === activeBoardId || board.name === activeBoardId,
            ) ??
            (boardsQuery.data ?? [])[0] ??
            null,
        [activeBoardId, boardsQuery.data],
    );

    const columnsQuery = useQuery({
        queryKey: ['columns', activeBoard?.id],
        queryFn: () => getColumns(activeBoard?.id as string),
        enabled: Boolean(activeBoard?.id),
    });

    const liveTasks = useMemo(
        () => (tasksQuery.data ?? []).map(mapTaskResponseToTask),
        [tasksQuery.data],
    );
    const boardColumns = useMemo(
        () =>
            (columnsQuery.data ?? []).map((column) => ({
                id: column.id,
                name: column.name,
            })),
        [columnsQuery.data],
    );

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onMutate: async () => {
            setTaskActionError(null);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['tasks'],
            });
            await queryClient.refetchQueries({
                queryKey: ['tasks'],
            });
        },
        onError: (error) => {
            console.error(error);
        },
    });
    const moveTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            columnId,
            position,
        }: {
            taskId: string;
            columnId: string;
            position: number;
        }) => moveTask(taskId, { columnId, position }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['tasks'],
            });
        },
    });
    const updateScheduledTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            dueDate,
            position,
        }: {
            taskId: string;
            dueDate: string;
            position: number;
        }) => updateTask(taskId, { dueDate, position }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['tasks'],
            });
        },
    });

    const sourceTasks = useMemo(
        () =>
            selectTasksForScope({
                activeBoardId,
                activeProjectId,
                isOrganizationScope,
                selectedProjectId: organizationProjectFilter,
                tasks: liveTasks,
            }),
        [
            activeBoardId,
            activeProjectId,
            isOrganizationScope,
            liveTasks,
            organizationProjectFilter,
        ],
    );

    const canCreateTasks =
        !isOrganizationScope &&
        Boolean(activeProjectId) &&
        Boolean(activeBoard?.id) &&
        boardColumns.length > 0;

    const resolveCreateContext = async () => {
        if (isOrganizationScope || !activeProjectId) {
            return null;
        }

        const boards =
            boardsQuery.data ??
            (await queryClient.fetchQuery({
                queryKey: ['boards', activeProjectId],
                queryFn: () => getBoards(activeProjectId),
            })) ??
            [];

        const resolvedBoard =
            boards.find(
                (board) =>
                    board.id === activeBoardId || board.name === activeBoardId,
            ) ??
            boards[0] ??
            null;

        if (!resolvedBoard) {
            return null;
        }

        const columns =
            resolvedBoard.id === activeBoard?.id && columnsQuery.data
                ? columnsQuery.data
                : await queryClient.fetchQuery({
                      queryKey: ['columns', resolvedBoard.id],
                      queryFn: () => getColumns(resolvedBoard.id),
                  });

        const resolvedColumn = columns[0] ?? null;

        if (!resolvedColumn) {
            return null;
        }

        return {
            boardId: resolvedBoard.id,
            columnId: resolvedColumn.id,
        };
    };

    const handleCreateWeeklyTask = (dateKey: string, title: string) => {
        void (async () => {
            try {
                const createContext = await resolveCreateContext();

                if (!createContext) {
                    setTaskActionError(
                        'Не удалось определить активную доску или колонку для создания задачи.',
                    );
                    return;
                }

                setTaskActionError(null);
                await createTaskMutation.mutateAsync({
                    title,
                    dueDate: `${dateKey}T09:00:00.000Z`,
                    projectId: activeProjectId,
                    boardId: createContext.boardId,
                    columnId: createContext.columnId,
                });
            } catch (error) {
                console.error(error);
            }
        })();
    };

    const handleCreateBoardTask = (columnId: string, title: string) => {
        void (async () => {
            try {
                const createContext = await resolveCreateContext();

                if (!createContext) {
                    setTaskActionError(
                        'Не удалось определить активную доску или колонку для создания задачи.',
                    );
                    return;
                }

                setTaskActionError(null);

                const resolvedColumnId =
                    boardColumns.find((column) => column.id === columnId)?.id ??
                    columnId ??
                    createContext.columnId;

                await createTaskMutation.mutateAsync({
                    title,
                    dueDate: new Date().toISOString(),
                    projectId: activeProjectId,
                    boardId: createContext.boardId,
                    columnId: resolvedColumnId,
                });
            } catch (error) {
                console.error(error);
            }
        })();
    };

    const handleMoveBoardTask = ({
        taskId,
        columnId,
        position,
    }: {
        taskId: string;
        columnId: string;
        position: number;
    }) => {
        if (!canCreateTasks) {
            setTaskActionError(
                'Не удалось переместить задачу: активная доска или колонки не загружены.',
            );
            return;
        }

        moveTaskMutation.mutate({
            taskId,
            columnId,
            position,
        });
    };

    const handleMoveScheduledTask = ({
        taskId,
        dueDate,
        position,
    }: {
        taskId: string;
        dueDate: string;
        position: number;
    }) => {
        updateScheduledTaskMutation.mutate({
            taskId,
            dueDate,
            position,
        });
    };

    if (!isOrganizationScope && activeProjectTab === 'Обзор') {
        return (
            <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
                <Overview />
            </div>
        );
    }

    return (
        <HomePageContent
            key={`${scope}:${activeProjectId}:${activeBoardId}:${organizationProjectFilter}`}
            activeBoardId={activeBoardId}
            boardColumns={boardColumns}
            createTaskError={
                createTaskMutation.error instanceof Error
                    ? createTaskMutation.error.message
                    : moveTaskMutation.error instanceof Error
                      ? moveTaskMutation.error.message
                      : updateScheduledTaskMutation.error instanceof Error
                        ? updateScheduledTaskMutation.error.message
                        : taskActionError
            }
            canCreateTasks={canCreateTasks}
            isOrganizationScope={isOrganizationScope}
            isCreatingTask={createTaskMutation.isPending}
            loading={tasksQuery.isLoading}
            projects={projects}
            selectedProjectId={organizationProjectFilter}
            sourceTasks={sourceTasks}
            taskLoadError={
                tasksQuery.error instanceof Error
                    ? tasksQuery.error.message
                    : null
            }
            onCreateBoardTask={handleCreateBoardTask}
            onCreateWeeklyTask={handleCreateWeeklyTask}
            onMoveBoardTask={handleMoveBoardTask}
            onMoveScheduledTask={handleMoveScheduledTask}
            onSelectedProjectIdChange={setOrganizationProjectFilter}
        />
    );
};

export default HomePage;
