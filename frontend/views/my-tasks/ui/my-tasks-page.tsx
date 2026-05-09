'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/shared/ui';
import {
    myTasksFilters,
    myTasksGroups,
    type MyTasksFilter,
    type TaskGroup,
    type TaskRow,
} from '@/views/my-tasks/model';
import MyTasksFilterTabs from './my-tasks-filter-tabs';
import MyTasksTable from './my-tasks-table';

const cloneGroups = (groups: TaskGroup[]) =>
    groups.map((group) => ({
        ...group,
        rows: group.rows.map((row) => ({
            ...row,
            assignees: row.assignees ? [...row.assignees] : undefined,
            tags: row.tags ? [...row.tags] : undefined,
            filters: row.filters ? [...row.filters] : undefined,
        })),
    }));

const MyTasksPage = () => {
    const [groups, setGroups] = useState<TaskGroup[]>(() =>
        cloneGroups(myTasksGroups),
    );
    const [activeFilter, setActiveFilter] = useState<MyTasksFilter>(
        myTasksFilters[0],
    );
    const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(() =>
        myTasksGroups
            .filter((group) => group.expanded)
            .map((group) => group.id),
    );
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [creatingGroupId, setCreatingGroupId] = useState<string | null>(null);
    const [taskDraft, setTaskDraft] = useState('');

    const visibleGroups = useMemo(
        () =>
            groups.map((group) => ({
                ...group,
                rows: group.rows.filter(
                    (task) =>
                        !task.filters || task.filters.includes(activeFilter),
                ),
            })),
        [activeFilter, groups],
    );

    const allVisibleTasks = useMemo(
        () => visibleGroups.flatMap((group) => group.rows),
        [visibleGroups],
    );

    const selectedTask = useMemo(
        () =>
            allVisibleTasks.find((task) => task.id === selectedTaskId) ?? null,
        [allVisibleTasks, selectedTaskId],
    );

    const completedCount = allVisibleTasks.filter(
        (task) => task.completed,
    ).length;
    const openCount = allVisibleTasks.length - completedCount;

    const createTask = (groupId: string) => {
        const title = taskDraft.trim();

        if (!title) {
            return;
        }

        const newTaskId = `${groupId}-${Date.now()}`;

        setGroups((currentGroups) =>
            currentGroups.map((group) => {
                if (group.id !== groupId) {
                    return group;
                }

                const nextNumber = 30 + group.rows.length + 1;
                const nextTask: TaskRow = {
                    id: newTaskId,
                    title,
                    number: `#${nextNumber}`,
                    filters: [activeFilter],
                    assignees:
                        activeFilter === 'Порученные мной'
                            ? [
                                  {
                                      name: 'Артем',
                                      initials: 'AR',
                                      className: 'bg-slate-100 text-slate-600',
                                  },
                              ]
                            : [
                                  {
                                      name: 'Flay',
                                      initials: 'FL',
                                      className:
                                          'bg-emerald-100 text-emerald-700',
                                  },
                              ],
                    project: 'Develop',
                    board: 'main',
                    boardMark: 'M',
                    column:
                        activeFilter === 'Мои приватные задачи'
                            ? 'Draft'
                            : 'Backlog',
                    columnMark:
                        activeFilter === 'Мои приватные задачи' ? 'DR' : 'B',
                    date: 'Сегодня',
                    tags: [
                        {
                            label:
                                activeFilter === 'Мои приватные задачи'
                                    ? 'private'
                                    : 'frontend',
                            className:
                                activeFilter === 'Мои приватные задачи'
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'bg-fuchsia-100 text-fuchsia-700',
                        },
                    ],
                    completed: false,
                };

                return {
                    ...group,
                    rows: [nextTask, ...group.rows],
                };
            }),
        );

        setSelectedTaskId(newTaskId);
        setTaskDraft('');
        setCreatingGroupId(null);
    };

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
                                setCreatingGroupId(null);
                                setTaskDraft('');
                            }}
                        />
                    </div>

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
                        groups={visibleGroups}
                        expandedGroupIds={expandedGroupIds}
                        selectedTaskId={selectedTaskId}
                        onToggleGroup={(groupId) =>
                            setExpandedGroupIds((current) =>
                                current.includes(groupId)
                                    ? current.filter((id) => id !== groupId)
                                    : [...current, groupId],
                            )
                        }
                        onSelectTask={(_, taskId) => setSelectedTaskId(taskId)}
                        onToggleTaskComplete={(groupId, taskId) =>
                            setGroups((currentGroups) =>
                                currentGroups.map((group) => {
                                    if (group.id !== groupId) {
                                        return group;
                                    }

                                    return {
                                        ...group,
                                        rows: group.rows.map((task) =>
                                            task.id === taskId
                                                ? (() => {
                                                      const nextCompleted =
                                                          !task.completed;

                                                      return {
                                                          ...task,
                                                          completed:
                                                              nextCompleted,
                                                          column: nextCompleted
                                                              ? 'Done'
                                                              : 'In progress',
                                                          columnMark:
                                                              nextCompleted
                                                                  ? 'D'
                                                                  : 'IP',
                                                      };
                                                  })()
                                                : task,
                                        ),
                                    };
                                }),
                            )
                        }
                        creatingGroupId={creatingGroupId}
                        taskDraft={taskDraft}
                        onStartCreateTask={(groupId) => {
                            setCreatingGroupId(groupId);
                            setTaskDraft('');
                            setExpandedGroupIds((current) =>
                                current.includes(groupId)
                                    ? current
                                    : [...current, groupId],
                            );
                        }}
                        onTaskDraftChange={setTaskDraft}
                        onSubmitTask={createTask}
                        onCancelCreateTask={() => {
                            setCreatingGroupId(null);
                            setTaskDraft('');
                        }}
                    />
                </div>
            </section>
        </div>
    );
};

export default MyTasksPage;
