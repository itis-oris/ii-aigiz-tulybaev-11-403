import React from 'react';
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react';
import { Clock3, Plus } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import {
    Badge,
    Button,
    Card,
    CardAction,
    CardContent,
    CardDescription,
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
import { getTagBadgeStyle } from '@/shared/lib/tag-color/index';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';

const getStoryPointsLabel = (storyPoints?: number) => {
    if (storyPoints === undefined) {
        return null;
    }

    return `${storyPoints} ч`;
};

const getPriorityLabel = (priority?: number) => {
    if (priority === undefined) {
        return null;
    }

    if (priority <= 1) {
        return 'Высокий';
    }

    if (priority === 2) {
        return 'Средний';
    }

    return 'Низкий';
};

interface BoardProps {
    days: DayTasks[];
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
    extraColumn?: React.ReactNode;
    onCreateTask?: (columnId: string, title: string) => void;
    onMoveTask?: (payload: {
        taskId: string;
        columnId: string;
        position: number;
    }) => void;
    dragEnabled?: boolean;
    settings?: HomeHeaderSettingsValue;
}

type BoardColumnProps = {
    column: Column;
    draggingTaskId: string | null;
    dropPosition: DropPosition;
    onCreateTask?: (columnId: string, title: string) => void;
    onOpen: (task: Task) => void;
    overColumnId: string | null;
    overTaskId: string | null;
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
                {onCreateTask ? (
                    <div
                        className={cn(
                            'rounded-lg bg-card/40 p-2',
                            settings?.density === 'compact' && 'p-1.5',
                        )}
                    >
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
                                className={cn(
                                    'h-9 border-transparent bg-background/80 text-foreground placeholder:text-muted-foreground focus-visible:border-ring',
                                    settings?.density === 'compact' &&
                                        'h-8 text-xs',
                                )}
                            />
                            <Button
                                type="button"
                                size="md"
                                title="Добавить задачу"
                                onClick={handleCreateTask}
                                disabled={!newTaskTitle.trim()}
                                className={cn(
                                    'shrink-0',
                                    settings?.density === 'compact' &&
                                        'h-8 px-2 text-xs',
                                )}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}
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
    draggingTaskId: string | null;
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
    const customTags = task.tags.filter(
        (tag) => !(tag.system && task.boardId && tag.id === task.boardId),
    );
    const visibleTags = customTags.length > 0 ? customTags : task.tags;
    const storyPointsLabel = getStoryPointsLabel(task.storyPoints);
    const priorityLabel = getPriorityLabel(task.priority);
    const normalizedDescription = task.description?.trim();

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
                'relative cursor-grab touch-none select-none border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md',
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
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="default" size="sm">
                        {task.status}
                    </Badge>
                    {storyPointsLabel ? (
                        <Badge variant="outline" size="sm">
                            <Clock3 className="size-3" />
                            {storyPointsLabel}
                        </Badge>
                    ) : null}
                    {priorityLabel ? (
                        <Badge variant="outline" size="sm">
                            {priorityLabel}
                        </Badge>
                    ) : null}
                </div>
                {normalizedDescription ? (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {normalizedDescription}
                    </p>
                ) : null}
                {visibleTags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {visibleTags.map((tag) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                size="sm"
                                style={getTagBadgeStyle(tag.color)}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};

const Board = ({
    days,
    setIsOpen,
    setSelectedTask,
    extraColumn,
    onCreateTask,
    onMoveTask,
    dragEnabled = true,
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
    } = useBoardDnd(days, {
        enabled: dragEnabled,
        onCommitMove: onMoveTask,
    });

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
