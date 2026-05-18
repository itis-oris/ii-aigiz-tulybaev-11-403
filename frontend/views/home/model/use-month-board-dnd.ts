'use client';

import { useEffect, useState } from 'react';
import type {
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/react';
import { type DayTasks, type Task } from '@/views/home/model/task';
import {
    createMonthDays,
    normalizeColumnTasks,
    sortTasks,
} from '@/views/home/ui/board/month-board.lib';

export type DropPosition = 'before' | 'after' | null;
type CommitMovePayload = {
    taskId: string;
    dueDate: string;
    position: number;
};

const getTaskColumnId = (days: DayTasks[], taskId: string) =>
    days.find((day) => day.tasks.some((task) => task.id === taskId))
        ?.columnId ?? null;

const withDateKey = (task: Task, dateKey: string) => {
    const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();

    if (Number.isNaN(baseDate.getTime())) {
        return task;
    }

    return {
        ...task,
        dueDate: `${dateKey}T09:00:00.000Z`,
        columnId: dateKey,
    };
};

const moveTaskBetweenDays = (
    days: DayTasks[],
    taskId: string,
    target:
        | {
              type: 'task';
              taskId: string;
              dropPosition: Exclude<DropPosition, null>;
          }
        | { type: 'column'; columnId: string },
) => {
    const taskLookup = new Map(
        days.flatMap((day) => day.tasks).map((task) => [task.id, task]),
    );
    const sourceTask = taskLookup.get(taskId);

    if (!sourceTask) {
        return days;
    }

    if (target.type === 'task' && target.taskId === taskId) {
        return days;
    }

    const targetColumnId =
        target.type === 'task'
            ? taskLookup.get(target.taskId)?.columnId
            : target.columnId;

    if (!targetColumnId) {
        return days;
    }

    const columnTasks = new Map(
        days.map((day) => [day.columnId, sortTasks(day.tasks)]),
    );

    for (const [columnId, tasks] of columnTasks.entries()) {
        columnTasks.set(
            columnId,
            tasks.filter((task) => task.id !== taskId),
        );
    }

    const nextTask = withDateKey(sourceTask, targetColumnId);
    const targetTasks = [...(columnTasks.get(targetColumnId) ?? [])];

    if (target.type === 'task') {
        const targetIndex = targetTasks.findIndex(
            (task) => task.id === target.taskId,
        );
        const insertIndex =
            targetIndex === -1
                ? targetTasks.length
                : target.dropPosition === 'before'
                  ? targetIndex
                  : targetIndex + 1;

        targetTasks.splice(insertIndex, 0, nextTask);
    } else {
        targetTasks.push(nextTask);
    }

    columnTasks.set(targetColumnId, targetTasks);

    return days.map((day) => ({
        ...day,
        tasks: normalizeColumnTasks(
            columnTasks.get(day.columnId) ?? [],
            day.columnId,
        ),
    }));
};

export const getMonthTaskDragId = (taskId: string | number) =>
    `month-task:${taskId}`;
export const getMonthTaskDropId = (taskId: string | number) =>
    `month-task-drop:${taskId}`;
export const getMonthDayDropId = (dateKey: string) => `month-day:${dateKey}`;

const parseMonthTaskDragId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('month-task:')) {
        return null;
    }

    return value.slice('month-task:'.length);
};

const parseMonthTaskDropId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('month-task-drop:')) {
        return null;
    }

    return value.slice('month-task-drop:'.length);
};

const parseMonthDayDropId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('month-day:')) {
        return null;
    }

    return value.slice('month-day:'.length);
};

export const useMonthBoardDnd = (
    tasks: Task[],
    monthStart: Date,
    options?: {
        onCommitMove?: (payload: CommitMovePayload) => void;
    },
) => {
    const [monthDays, setMonthDays] = useState<DayTasks[]>(() =>
        createMonthDays(tasks, monthStart),
    );
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [overDateKey, setOverDateKey] = useState<string | null>(null);
    const [overTaskId, setOverTaskId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>(null);
    const [pointerY, setPointerY] = useState<number | null>(null);

    useEffect(() => {
        setMonthDays(createMonthDays(tasks, monthStart));
    }, [tasks, monthStart]);

    const resetDragState = () => {
        setDraggingTaskId(null);
        setOverDateKey(null);
        setOverTaskId(null);
        setDropPosition(null);
        setPointerY(null);
    };

    const handleDragStart = ({ operation }: DragStartEvent) => {
        setDraggingTaskId(parseMonthTaskDragId(operation.source?.id));
    };

    const handleDragMove = ({ nativeEvent }: DragMoveEvent) => {
        if (nativeEvent instanceof MouseEvent) {
            setPointerY(nativeEvent.clientY);
        }

        if (nativeEvent instanceof PointerEvent) {
            setPointerY(nativeEvent.clientY);
        }
    };

    const handleDragOver = ({ operation }: DragOverEvent) => {
        const nextTaskId = parseMonthTaskDropId(operation.target?.id);
        const nextDateKey =
            parseMonthDayDropId(operation.target?.id) ??
            (nextTaskId !== null
                ? getTaskColumnId(monthDays, nextTaskId)
                : null);

        setOverTaskId(nextTaskId);
        setOverDateKey(nextDateKey);

        if (
            nextTaskId !== null &&
            operation.target?.element instanceof HTMLElement &&
            pointerY !== null
        ) {
            const rect = operation.target.element.getBoundingClientRect();
            setDropPosition(
                pointerY <= rect.top + rect.height / 2 ? 'before' : 'after',
            );
            return;
        }

        setDropPosition(null);
    };

    const handleDragEnd = ({ operation }: DragEndEvent) => {
        const taskId = parseMonthTaskDragId(operation.source?.id);
        const targetTaskId = parseMonthTaskDropId(operation.target?.id);
        const targetDateKey = parseMonthDayDropId(operation.target?.id);

        if (taskId !== null && targetTaskId !== null) {
            setMonthDays((currentDays) => {
                const nextDays = moveTaskBetweenDays(currentDays, taskId, {
                    type: 'task',
                    taskId: targetTaskId,
                    dropPosition: dropPosition ?? 'before',
                });
                const movedTask = nextDays
                    .flatMap((day) => day.tasks)
                    .find((task) => task.id === taskId);

                if (movedTask?.dueDate) {
                    options?.onCommitMove?.({
                        taskId,
                        dueDate: movedTask.dueDate,
                        position: Number(movedTask.position ?? 0),
                    });
                }

                return nextDays;
            });
        } else if (taskId !== null && targetDateKey) {
            setMonthDays((currentDays) => {
                const nextDays = moveTaskBetweenDays(currentDays, taskId, {
                    type: 'column',
                    columnId: targetDateKey,
                });
                const movedTask = nextDays
                    .flatMap((day) => day.tasks)
                    .find((task) => task.id === taskId);

                if (movedTask?.dueDate) {
                    options?.onCommitMove?.({
                        taskId,
                        dueDate: movedTask.dueDate,
                        position: Number(movedTask.position ?? 0),
                    });
                }

                return nextDays;
            });
        }

        resetDragState();
    };

    return {
        monthDays,
        draggingTaskId,
        overDateKey,
        overTaskId,
        dropPosition,
        handleDragStart,
        handleDragMove,
        handleDragOver,
        handleDragEnd,
    };
};
