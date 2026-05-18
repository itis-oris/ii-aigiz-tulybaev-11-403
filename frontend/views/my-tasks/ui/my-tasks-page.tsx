'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTasks, updateTaskStatus } from '@/shared/api';
import { useAuth } from '@/shared/lib';
import { Badge } from '@/shared/ui';
import {
    myTasksFilters,
    type Assignee,
    type MyTasksFilter,
    type TaskGroup,
    type TaskRow,
    type TaskTag,
} from '@/views/my-tasks/model';
import { mapTaskResponseToTask, type Task } from '@/views/home/model/task';
import { TaskSheet } from '@/views/home/ui/task-sheet';
import MyTasksFilterTabs from './my-tasks-filter-tabs';
import MyTasksTable from './my-tasks-table';

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    return date;
};

const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
};

const getDateBucket = (dueDate?: string) => {
    if (!dueDate) {
        return 'other';
    }

    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'other';
    }

    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const yesterday = addDays(today, -1);

    parsedDate.setHours(0, 0, 0, 0);

    if (parsedDate.getTime() === today.getTime()) {
        return 'today';
    }

    if (parsedDate.getTime() === tomorrow.getTime()) {
        return 'tomorrow';
    }

    if (parsedDate.getTime() === yesterday.getTime()) {
        return 'yesterday';
    }

    return 'other';
};

const formatTaskDate = (dueDate?: string) => {
    if (!dueDate) {
        return 'Без срока';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
    }).format(new Date(dueDate));
};

const getPriorityLabel = (priority?: number) => {
    if (priority === undefined) {
        return 'Не указан';
    }

    if (priority <= 1) {
        return 'Высокий';
    }

    if (priority === 2) {
        return 'Средний';
    }

    return 'Низкий';
};

const getInitials = (value?: string) => {
    if (!value) {
        return 'NA';
    }

    const source = value.includes('@') ? value.split('@')[0] : value;
    const parts = source
        .split(/[._\-\s]+/)
        .filter(Boolean)
        .slice(0, 2);

    const initials = parts
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);

    return initials || source.slice(0, 2).toUpperCase() || 'NA';
};

const getAssignees = (task: Task): Assignee[] | undefined => {
    if (!task.assigneeEmail) {
        return undefined;
    }

    return [
        {
            name: task.assigneeEmail,
            initials: getInitials(task.assigneeEmail),
            className: 'bg-emerald-100 text-emerald-700',
        },
    ];
};

const getTaskTags = (task: Task): TaskTag[] | undefined => {
    if (!task.tags.length) {
        return undefined;
    }

    return task.tags.map((tag) => ({
        id: tag.id,
        label: tag.name,
        color: tag.color,
    }));
};

const getColumnMark = (value?: string) =>
    value
        ? value
              .split(/\s+/)
              .map((part) => part[0]?.toUpperCase() ?? '')
              .join('')
              .slice(0, 2)
        : undefined;

const getTaskFilters = (task: Task, userId?: string): MyTasksFilter[] => {
    const filters: MyTasksFilter[] = [];

    if (userId && task.assigneeId === userId) {
        filters.push('Назначенные мне');
    }

    if (userId && task.creatorId === userId) {
        filters.push('Порученные мной');
    }

    if (userId && task.creatorId === userId && task.isPrivate) {
        filters.push('Мои приватные задачи');
    }

    return filters;
};

const mapTaskToTaskRow = (task: Task, userId?: string): TaskRow => ({
    id: String(task.id),
    title: task.title,
    number: `#${String(task.id).slice(0, 8)}`,
    filters: getTaskFilters(task, userId),
    assignees: getAssignees(task),
    project: task.project,
    board: task.boardName ?? 'Без доски',
    boardMark: getColumnMark(task.boardName),
    column: task.columnName ?? 'Без колонки',
    columnMark: getColumnMark(task.columnName),
    date: formatTaskDate(task.dueDate),
    priority: getPriorityLabel(task.priority),
    tags: getTaskTags(task),
    completed: task.status === 'done',
});

const createEmptyGroups = (): TaskGroup[] => [
    {
        id: 'today',
        title: 'Сегодня',
        expanded: true,
        rows: [],
    },
    {
        id: 'tomorrow',
        title: 'Завтра',
        expanded: false,
        rows: [],
    },
    {
        id: 'yesterday',
        title: 'Вчера',
        expanded: false,
        rows: [],
    },
    {
        id: 'other',
        title: 'Другие задачи',
        expanded: true,
        rows: [],
    },
];

const buildGroups = (tasks: Task[], filter: MyTasksFilter, userId?: string) => {
    const groups = createEmptyGroups();
    const groupMap = new Map(groups.map((group) => [group.id, group]));

    tasks.forEach((task) => {
        const filters = getTaskFilters(task, userId);

        if (!filters.includes(filter)) {
            return;
        }

        const row = mapTaskToTaskRow(task, userId);
        const bucket = getDateBucket(task.dueDate);
        const targetGroup = groupMap.get(bucket);

        if (targetGroup) {
            targetGroup.rows.push(row);
        }
    });

    return groups;
};

const getTaskQueryFilters = (filter: MyTasksFilter, userId?: string) => {
    if (!userId) {
        return {};
    }

    if (filter === 'Мои приватные задачи') {
        return {
            creatorId: userId,
            isPrivate: true,
        };
    }

    if (filter === 'Назначенные мне') {
        return { assigneeId: userId };
    }

    return { creatorId: userId };
};

const MyTasksPage = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState<MyTasksFilter>(
        myTasksFilters[0],
    );
    const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([
        'today',
        'other',
    ]);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

    const tasksQuery = useQuery({
        queryKey: ['tasks', 'my-tasks', activeFilter, user?.userId],
        queryFn: () =>
            getTasks(getTaskQueryFilters(activeFilter, user?.userId)),
    });

    const updateTaskStatusMutation = useMutation({
        mutationFn: ({
            taskId,
            nextCompleted,
        }: {
            taskId: string;
            nextCompleted: boolean;
        }) =>
            updateTaskStatus(taskId, {
                status: nextCompleted ? 'DONE' : 'IN_PROGRESS',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['tasks'],
            });
        },
    });

    const liveTasks = useMemo(
        () => (tasksQuery.data ?? []).map(mapTaskResponseToTask),
        [tasksQuery.data],
    );
    const groups = useMemo(
        () => buildGroups(liveTasks, activeFilter, user?.userId),
        [activeFilter, liveTasks, user?.userId],
    );
    const allVisibleTasks = useMemo(
        () => groups.flatMap((group) => group.rows),
        [groups],
    );
    const selectedTask = useMemo(
        () =>
            liveTasks.find((task) => String(task.id) === selectedTaskId) ??
            null,
        [liveTasks, selectedTaskId],
    );

    const completedCount = allVisibleTasks.filter(
        (task) => task.completed,
    ).length;
    const openCount = allVisibleTasks.length - completedCount;

    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="w-full px-6 py-8">
                <div className="flex min-w-0 flex-col gap-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-semibold text-foreground">
                            Мои задачи
                        </h1>

                        <MyTasksFilterTabs
                            filters={myTasksFilters}
                            activeFilter={activeFilter}
                            onFilterChange={(filter) => {
                                setActiveFilter(filter);
                                setSelectedTaskId(null);
                                setIsTaskSheetOpen(false);
                            }}
                        />
                    </div>

                    {tasksQuery.isLoading ? (
                        <Badge
                            variant="subtle"
                            className="w-fit bg-muted px-3 py-1.5"
                        >
                            Загрузка задач...
                        </Badge>
                    ) : null}

                    {tasksQuery.error instanceof Error ? (
                        <Badge
                            variant="outline"
                            className="w-fit border-destructive/30 px-3 py-1.5 text-destructive"
                        >
                            {tasksQuery.error.message}
                        </Badge>
                    ) : null}

                    {updateTaskStatusMutation.error instanceof Error ? (
                        <Badge
                            variant="outline"
                            className="w-fit border-destructive/30 px-3 py-1.5 text-destructive"
                        >
                            Не удалось обновить статус задачи:{' '}
                            {updateTaskStatusMutation.error.message}
                        </Badge>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge
                            variant="subtle"
                            className="bg-muted px-3 py-1.5"
                        >
                            Всего: {allVisibleTasks.length}
                        </Badge>
                        <Badge
                            variant="subtle"
                            className="bg-muted px-3 py-1.5"
                        >
                            В работе: {openCount}
                        </Badge>
                        <Badge
                            variant="subtle"
                            className="bg-muted px-3 py-1.5"
                        >
                            Выполнено: {completedCount}
                        </Badge>
                        {selectedTask ? (
                            <Badge
                                variant="outline"
                                className="px-3 py-1.5 text-foreground"
                            >
                                Выбрано: {selectedTask.title}
                            </Badge>
                        ) : null}
                    </div>

                    <MyTasksTable
                        groups={groups}
                        expandedGroupIds={expandedGroupIds}
                        selectedTaskId={selectedTaskId}
                        onToggleGroup={(groupId) =>
                            setExpandedGroupIds((current) =>
                                current.includes(groupId)
                                    ? current.filter((id) => id !== groupId)
                                    : [...current, groupId],
                            )
                        }
                        onSelectTask={(_, taskId) => {
                            setSelectedTaskId(taskId);
                            setIsTaskSheetOpen(true);
                        }}
                        onToggleTaskComplete={(_, taskId) => {
                            const targetTask = liveTasks.find(
                                (task) => String(task.id) === taskId,
                            );

                            if (!targetTask) {
                                return;
                            }

                            updateTaskStatusMutation.mutate({
                                taskId,
                                nextCompleted:
                                    !targetTask.status.startsWith('done'),
                            });
                        }}
                    />
                </div>
            </section>
            <TaskSheet
                isOpen={isTaskSheetOpen}
                selectedTask={selectedTask}
                setIsOpen={setIsTaskSheetOpen}
                setSelectedTask={(task) => {
                    setSelectedTaskId(task ? String(task.id) : null);
                }}
            />
        </div>
    );
};

export default MyTasksPage;
