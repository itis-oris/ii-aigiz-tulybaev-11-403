'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/react';
import { type DayTasks, type Task } from '@/views/home/model/task';
import type { Column } from '@/views/home/ui/board/types';

export type DropPosition = 'before' | 'after' | null;

const getTaskColumnId = (days: DayTasks[], taskId: number) =>
    days.find((day) => day.tasks.some((task) => task.id === taskId))
        ?.columnId ?? null;

const sortTasks = (tasks: Task[]) =>
    [...tasks].sort(
        (left, right) =>
            Number(left.position ?? 0) - Number(right.position ?? 0),
    );

const normalizeColumnTasks = (tasks: Task[], columnId: string) =>
    tasks.map((task, index) => ({
        ...task,
        columnId,
        position: String((index + 1) * 1000),
    }));

const moveTaskBetweenColumns = (
    days: DayTasks[],
    taskId: number,
    target:
        | {
              type: 'task';
              taskId: number;
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

    const nextTask = {
        ...sourceTask,
        columnId: targetColumnId,
    };
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

const parseTaskDragId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('task:')) {
        return null;
    }

    return Number(value.slice('task:'.length));
};

const parseTaskDropId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('task-drop:')) {
        return null;
    }

    return Number(value.slice('task-drop:'.length));
};

const parseColumnDropId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('column:')) {
        return null;
    }

    return value.slice('column:'.length);
};

export const getBoardTaskDragId = (taskId: number) => `task:${taskId}`;
export const getBoardTaskDropId = (taskId: number) => `task-drop:${taskId}`;
export const getBoardColumnDropId = (columnId: string) => `column:${columnId}`;

export const useBoardDnd = (days: DayTasks[]) => {
    const [boardDays, setBoardDays] = useState(days);
    const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
    const [overColumnId, setOverColumnId] = useState<string | null>(null);
    const [overTaskId, setOverTaskId] = useState<number | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>(null);
    const [pointerY, setPointerY] = useState<number | null>(null);

    useEffect(() => {
        setBoardDays(days);
    }, [days]);

    const columns = useMemo<Column[]>(
        () =>
            boardDays.map((dayTask) => ({
                day: dayTask.day,
                date: dayTask.date,
                columnId: dayTask.columnId,
                tasks: sortTasks(dayTask.tasks),
            })),
        [boardDays],
    );

    const resetDragState = () => {
        setDraggingTaskId(null);
        setOverTaskId(null);
        setOverColumnId(null);
        setDropPosition(null);
        setPointerY(null);
    };

    const handleDragStart = ({ operation }: DragStartEvent) => {
        setDraggingTaskId(parseTaskDragId(operation.source?.id));
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
        const nextTaskId = parseTaskDropId(operation.target?.id);
        const nextColumnId =
            parseColumnDropId(operation.target?.id) ??
            (nextTaskId ? getTaskColumnId(boardDays, nextTaskId) : null);

        setOverTaskId(nextTaskId);
        setOverColumnId(nextColumnId);

        if (
            nextTaskId &&
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
        const taskId = parseTaskDragId(operation.source?.id);
        const targetTaskId = parseTaskDropId(operation.target?.id);
        const targetColumnId = parseColumnDropId(operation.target?.id);

        if (taskId && targetTaskId) {
            setBoardDays((currentDays) =>
                moveTaskBetweenColumns(currentDays, taskId, {
                    type: 'task',
                    taskId: targetTaskId,
                    dropPosition: dropPosition ?? 'before',
                }),
            );
        } else if (taskId && targetColumnId) {
            setBoardDays((currentDays) =>
                moveTaskBetweenColumns(currentDays, taskId, {
                    type: 'column',
                    columnId: targetColumnId,
                }),
            );
        }

        resetDragState();
    };

    return {
        columns,
        draggingTaskId,
        dropPosition,
        overColumnId,
        overTaskId,
        handleDragEnd,
        handleDragMove,
        handleDragOver,
        handleDragStart,
    };
};
