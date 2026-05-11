import React from 'react';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { Input } from '@/shared/ui/input';
import {
    Badge,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/shared/ui';
import { type Task, type DayTasks } from '@/views/home/model/task';
import {
    getBoardColumnDropId,
    getBoardTaskDragId,
    getBoardTaskDropId,
    type DropPosition,
    useBoardDnd,
} from '@/views/home/model/use-board-dnd';
import type { Column } from '@/views/home/ui/board/types';
import { cn } from '@/shared/lib';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';

interface BoardProps {
    days: DayTasks[];
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
    extraColumn?: React.ReactNode;
    onCreateTask?: (columnId: string, title: string) => void;
    settings?: HomeHeaderSettingsValue;
}

type BoardColumnProps = {
    column: Column;
    draggingTaskId: number | null;
    dropPosition: DropPosition;
    onCreateTask?: (columnId: string, title: string) => void;
    onOpen: (task: Task) => void;
    overColumnId: string | null;
    overTaskId: number | null;
    settings?: HomeHeaderSettingsValue;
};

const BoardColumn = ({
    column,
    draggingTaskId,
    dropPosition,
    onCreateTask,
    onOpen,
    overColumnId,
    overTaskId,
    settings,
}: BoardColumnProps) => {
    const { ref, isDropTarget } = useDroppable({
        id: getBoardColumnDropId(column.columnId),
    });
    const [newTaskTitle, setNewTaskTitle] = React.useState('');

    const handleCreateTask = () => {
        const trimmedTitle = newTaskTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        onCreateTask?.(column.columnId, trimmedTitle);
        setNewTaskTitle('');
    };

    return (
        <div
            ref={ref}
            className={cn(
                'flex h-full min-h-0 min-w-72 flex-col rounded-xl transition-colors',
                settings?.density === 'compact' ? 'p-1.5' : 'p-2',
                (isDropTarget || overColumnId === column.columnId) &&
                    'bg-accent/5',
            )}
        >
            <div className="mb-2 shrink-0">
                <div className="mb-1.5 flex flex-col">
                    <span className="text-[13px] font-semibold leading-none text-foreground">
                        {column.day}
                    </span>
                    <span className="mt-1 text-[11px] leading-none text-muted-foreground">
                        {column.date}
                    </span>
                </div>
                <Input
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleCreateTask();
                        }
                    }}
                    placeholder="Добавить задачу"
                    uiSize="md"
                    className={cn(
                        'border-border bg-background text-foreground placeholder:text-muted-foreground',
                        settings?.density === 'compact' && 'h-8 text-xs',
                    )}
                />
            </div>
            <div className="scrollbar-hover-overlay min-h-0 flex-1 pt-1">
                {column.tasks.map((task) => (
                    <BoardTaskCard
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

type BoardTaskCardProps = {
    task: Task;
    draggingTaskId: number | null;
    dropPosition: DropPosition;
    isOver: boolean;
    onOpen: (task: Task) => void;
    settings?: HomeHeaderSettingsValue;
};

const BoardTaskCard = ({
    task,
    draggingTaskId,
    dropPosition,
    isOver,
    onOpen,
    settings,
}: BoardTaskCardProps) => {
    const { ref: dropRef } = useDroppable({
        id: getBoardTaskDropId(task.id),
    });
    const { ref: dragRef, isDragging } = useDraggable({
        id: getBoardTaskDragId(task.id),
    });

    const setRefs = (element: HTMLElement | null) => {
        dropRef(element);
        dragRef(element);
    };

    return (
        <Card
            ref={setRefs}
            onClick={() => {
                if (draggingTaskId) {
                    return;
                }

                onOpen(task);
            }}
            className={cn(
                'relative cursor-grab border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md',
                settings?.density === 'compact' ? 'mb-2' : 'mb-3',
                (isDragging || draggingTaskId === task.id) && 'opacity-50',
                isOver && 'border-accent/70 bg-accent/5',
                isOver &&
                    dropPosition === 'before' &&
                    'before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-accent',
                isOver &&
                    dropPosition === 'after' &&
                    'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent',
            )}
        >
            <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                {settings?.showProjectName !== false ? (
                    <CardDescription>{task.project}</CardDescription>
                ) : null}
                <CardAction>
                    <Badge variant="accent" size="sm">
                        {task.dueInDays} дн.
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>#{task.id}</span>
                    <Badge variant="default" size="sm">
                        {task.status}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                    <Badge key={tag} variant="sidebar" size="sm">
                        {tag}
                    </Badge>
                ))}
            </CardFooter>
        </Card>
    );
};

const Board = ({
    days,
    setIsOpen,
    setSelectedTask,
    extraColumn,
    onCreateTask,
    settings,
}: BoardProps) => {
    const {
        columns,
        draggingTaskId,
        dropPosition,
        overColumnId,
        overTaskId,
        handleDragEnd,
        handleDragMove,
        handleDragOver,
        handleDragStart,
    } = useBoardDnd(days);

    const handleOpen = (task: Task) => {
        setIsOpen(true);
        setSelectedTask(task);
    };

    return (
        <DragDropProvider
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex min-h-0 flex-1 gap-1 overflow-x-auto overflow-y-hidden px-2 py-3">
                {columns.map((column) => (
                    <BoardColumn
                        key={column.columnId}
                        column={column}
                        draggingTaskId={draggingTaskId}
                        dropPosition={dropPosition}
                        onCreateTask={onCreateTask}
                        onOpen={handleOpen}
                        overColumnId={overColumnId}
                        overTaskId={overTaskId}
                        settings={settings}
                    />
                ))}
                {extraColumn}
            </div>
        </DragDropProvider>
    );
};

export default Board;
