'use client';

import React from 'react';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { Badge, Button, Input } from '@/shared/ui';
import { cn } from '@/shared/lib';
import { getTagBadgeStyle } from '@/shared/lib/tag-color/index';
import { type Task } from '@/views/home/model/task';
import type { DropPosition } from '@/views/home/model/use-month-board-dnd';
import {
    getMonthDayDropId,
    getMonthTaskDragId,
    getMonthTaskDropId,
} from '@/views/home/model/use-month-board-dnd';
import { dayFormatter, monthFormatter, weekDayLabels } from './month-board.lib';
import type { CalendarCell } from './month-board.types';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';

type MonthBoardGridProps = {
    monthStart: Date;
    weeks: CalendarCell[][];
    draggingTaskId: string | null;
    overDateKey: string | null;
    overTaskId: string | null;
    dropPosition: DropPosition;
    onOpen: (task: Task) => void;
    onCreateTask?: (dateKey: string, title: string, isPrivate: boolean) => void;
    onDragStart: React.ComponentProps<typeof DragDropProvider>['onDragStart'];
    onDragMove: React.ComponentProps<typeof DragDropProvider>['onDragMove'];
    onDragOver: React.ComponentProps<typeof DragDropProvider>['onDragOver'];
    onDragEnd: React.ComponentProps<typeof DragDropProvider>['onDragEnd'];
    settings?: HomeHeaderSettingsValue;
};

type MonthTaskCardProps = {
    task: Task;
    draggingTaskId: string | null;
    dropPosition: DropPosition;
    isOver: boolean;
    onOpen: (task: Task) => void;
    settings?: HomeHeaderSettingsValue;
};

const MonthTaskCard = ({
    task,
    draggingTaskId,
    dropPosition,
    isOver,
    onOpen,
    settings,
}: MonthTaskCardProps) => {
    const { ref: dropRef } = useDroppable({
        id: getMonthTaskDropId(task.id),
    });
    const { ref: dragRef, isDragging } = useDraggable({
        id: getMonthTaskDragId(task.id),
    });

    const setRefs = (element: HTMLButtonElement | null) => {
        dropRef(element);
        dragRef(element);
    };

    return (
        <button
            ref={setRefs}
            type="button"
            onClick={() => {
                if (draggingTaskId !== null) {
                    return;
                }

                onOpen(task);
            }}
            className={cn(
                'relative w-full cursor-grab touch-none select-none rounded-md border border-border bg-card text-left transition-colors hover:border-ring hover:bg-accent/5',
                settings?.density === 'compact' ? 'px-1.5 py-1' : 'px-2 py-1',
                (isDragging || draggingTaskId === task.id) && 'opacity-50',
                isOver && 'border-accent/70 bg-accent/5',
                isOver &&
                    dropPosition === 'before' &&
                    'before:absolute before:inset-x-2 before:top-0 before:h-0.5 before:rounded-full before:bg-accent',
                isOver &&
                    dropPosition === 'after' &&
                    'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent',
            )}
        >
            <div className="pointer-events-none truncate text-[11px] font-medium text-foreground">
                {task.title}
            </div>
            <div className="pointer-events-none mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                {settings?.showProjectName !== false ? (
                    <>
                        <span className="truncate">{task.project}</span>
                        <span>·</span>
                    </>
                ) : null}
                <span>
                    {task.dueDate
                        ? dayFormatter.format(new Date(task.dueDate))
                        : ''}
                </span>
            </div>
            {task.tags.length ? (
                <div className="pointer-events-none mt-1 flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            size="sm"
                            style={getTagBadgeStyle(tag.color)}
                            className="max-w-full"
                        >
                            <span className="truncate">{tag.name}</span>
                        </Badge>
                    ))}
                </div>
            ) : null}
        </button>
    );
};

type MonthDayCellProps = {
    cell: CalendarCell;
    draggingTaskId: string | null;
    dropPosition: DropPosition;
    overDateKey: string | null;
    overTaskId: string | null;
    onOpen: (task: Task) => void;
    onCreateTask?: (dateKey: string, title: string, isPrivate: boolean) => void;
    settings?: HomeHeaderSettingsValue;
};

const MonthDayCell = ({
    cell,
    draggingTaskId,
    dropPosition,
    overDateKey,
    overTaskId,
    onOpen,
    onCreateTask,
    settings,
}: MonthDayCellProps) => {
    const { ref, isDropTarget } = useDroppable({
        id: getMonthDayDropId(cell.dateKey),
    });
    const [newTaskTitle, setNewTaskTitle] = React.useState('');
    const [isPrivate, setIsPrivate] = React.useState(false);

    const handleCreateTask = () => {
        const trimmedTitle = newTaskTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        onCreateTask?.(cell.dateKey, trimmedTitle, isPrivate);
        setNewTaskTitle('');
        setIsPrivate(false);
    };

    return (
        <div
            ref={ref}
            className={cn(
                'flex min-h-32 flex-col bg-background align-top transition-colors',
                settings?.density === 'compact' ? 'p-1.5' : 'p-2',
                !cell.isCurrentMonth && 'bg-muted/35',
                (isDropTarget || overDateKey === cell.dateKey) && 'bg-accent/5',
            )}
        >
            <div className="mb-2 flex items-center justify-between">
                <span
                    className={cn(
                        'text-xs font-medium text-foreground',
                        !cell.isCurrentMonth && 'text-muted-foreground',
                    )}
                >
                    {cell.date.getDate()}
                </span>
                {settings?.showTaskCounters !== false &&
                cell.tasks.length > 0 ? (
                    <Badge variant="sidebar" size="sm">
                        {cell.tasks.length}
                    </Badge>
                ) : null}
            </div>
            {onCreateTask ? (
                <div className="mb-2 space-y-2">
                    <div className="flex items-center gap-2">
                        <Input
                            value={newTaskTitle}
                            onChange={(event) =>
                                setNewTaskTitle(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleCreateTask();
                                }
                            }}
                            placeholder="Добавить задачу"
                            uiSize="md"
                            className="h-8 border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateTask}
                            disabled={!newTaskTitle.trim()}
                        >
                            Добавить
                        </Button>
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(event) =>
                                setIsPrivate(event.target.checked)
                            }
                            className="size-4 rounded border-border"
                        />
                        <span>Приватная</span>
                    </label>
                </div>
            ) : null}
            <div className="space-y-1">
                {cell.tasks.map((task) => (
                    <MonthTaskCard
                        key={task.id}
                        task={task}
                        draggingTaskId={draggingTaskId}
                        dropPosition={dropPosition}
                        isOver={overTaskId === task.id}
                        onOpen={onOpen}
                        settings={settings}
                    />
                ))}
            </div>
        </div>
    );
};

const MonthBoardGrid = ({
    monthStart,
    weeks,
    draggingTaskId,
    overDateKey,
    overTaskId,
    dropPosition,
    onOpen,
    onCreateTask,
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    settings,
}: MonthBoardGridProps) => (
    <DragDropProvider
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
    >
        <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
            <div className="mb-3 px-1">
                <h2 className="text-base font-semibold capitalize text-foreground">
                    {monthFormatter.format(monthStart)}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    Календарное представление задач по дате дедлайна.
                </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 gap-px bg-border">
                    {weekDayLabels.map((label) => (
                        <div
                            key={label}
                            className="bg-muted px-3 py-2 text-[11px] font-medium text-muted-foreground"
                        >
                            {label}
                        </div>
                    ))}
                </div>
                <div className="space-y-px bg-border">
                    {weeks.map((week, weekIndex) => (
                        <div
                            key={week[0]?.dateKey ?? weekIndex}
                            className="grid grid-cols-7 gap-px bg-border"
                        >
                            {week.map((cell) => (
                                <MonthDayCell
                                    key={cell.dateKey}
                                    cell={cell}
                                    draggingTaskId={draggingTaskId}
                                    dropPosition={dropPosition}
                                    overDateKey={overDateKey}
                                    overTaskId={overTaskId}
                                    onOpen={onOpen}
                                    onCreateTask={onCreateTask}
                                    settings={settings}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </DragDropProvider>
);

export default MonthBoardGrid;
