'use client';

import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib';
import { type Task } from '@/views/home/model/task';
import type { DropPosition } from '@/views/home/model/use-month-board-dnd';
import {
    getMonthDayDropId,
    getMonthTaskDragId,
    getMonthTaskDropId,
} from '@/views/home/model/use-month-board-dnd';
import { dayFormatter, monthFormatter, weekDayLabels } from './month-board.lib';
import type { CalendarCell } from './month-board.types';

type MonthBoardGridProps = {
    monthStart: Date;
    weeks: CalendarCell[][];
    draggingTaskId: number | null;
    overDateKey: string | null;
    overTaskId: number | null;
    dropPosition: DropPosition;
    onOpen: (task: Task) => void;
    onDragStart: React.ComponentProps<typeof DragDropProvider>['onDragStart'];
    onDragMove: React.ComponentProps<typeof DragDropProvider>['onDragMove'];
    onDragOver: React.ComponentProps<typeof DragDropProvider>['onDragOver'];
    onDragEnd: React.ComponentProps<typeof DragDropProvider>['onDragEnd'];
};

type MonthTaskCardProps = {
    task: Task;
    draggingTaskId: number | null;
    dropPosition: DropPosition;
    isOver: boolean;
    onOpen: (task: Task) => void;
};

const MonthTaskCard = ({
    task,
    draggingTaskId,
    dropPosition,
    isOver,
    onOpen,
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
                'relative w-full cursor-grab touch-none select-none rounded-md border border-border bg-card px-2 py-1 text-left transition-colors hover:border-ring hover:bg-accent/5',
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
                <span className="truncate">{task.project}</span>
                <span>·</span>
                <span>
                    {task.dueDate
                        ? dayFormatter.format(new Date(task.dueDate))
                        : ''}
                </span>
            </div>
        </button>
    );
};

type MonthDayCellProps = {
    cell: CalendarCell;
    draggingTaskId: number | null;
    dropPosition: DropPosition;
    overDateKey: string | null;
    overTaskId: number | null;
    onOpen: (task: Task) => void;
};

const MonthDayCell = ({
    cell,
    draggingTaskId,
    dropPosition,
    overDateKey,
    overTaskId,
    onOpen,
}: MonthDayCellProps) => {
    const { ref, isDropTarget } = useDroppable({
        id: getMonthDayDropId(cell.dateKey),
    });

    return (
        <div
            ref={ref}
            className={cn(
                'flex min-h-32 flex-col bg-background p-2 align-top transition-colors',
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
                {cell.tasks.length > 0 ? (
                    <Badge variant="sidebar" size="sm">
                        {cell.tasks.length}
                    </Badge>
                ) : null}
            </div>
            <div className="space-y-1">
                {cell.tasks.map((task) => (
                    <MonthTaskCard
                        key={task.id}
                        task={task}
                        draggingTaskId={draggingTaskId}
                        dropPosition={dropPosition}
                        isOver={overTaskId === task.id}
                        onOpen={onOpen}
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
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
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
