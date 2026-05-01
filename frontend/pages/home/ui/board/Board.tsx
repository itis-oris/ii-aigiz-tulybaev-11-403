import React, { useState } from 'react';
import { Input } from '@/shared/ui/input';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/shared/ui';
import { useDraggable } from '@dnd-kit/react';
import { mockDays, type Task } from '@/pages/home/model/task';
import type { Column } from '@/pages/home/ui/board/types';
import { cn } from '@/shared/lib';

interface BoardProps {
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
}

const Board = ({ setIsOpen, setSelectedTask }: BoardProps) => {
    const { ref } = useDraggable({
        id: 'draggable',
    });

    const handleOpen = (task: Task) => {
        setIsOpen(true);
        setSelectedTask(task);
    };

    const [column] = useState<Column[]>(() =>
        mockDays.map((dayTask) => ({
            day: dayTask.day,
            date: dayTask.date,
            columnId: dayTask.columnId,
            tasks: dayTask.tasks,
        })),
    );
    const [tasks] = useState<Task[]>(() =>
        mockDays.flatMap((dayTask) => dayTask.tasks),
    );
    const [draggingTaskId] = useState<number | null>(null);
    const [overColumnId] = useState<string | null>(null);
    const [overTaskId] = useState<number | null>(null);
    const [dropPosition] = useState<'before' | 'after' | null>(null);

    return (
        <div className="flex min-h-0 flex-1 gap-1 overflow-x-auto overflow-y-hidden px-2 py-3">
            {column.map((elem, index) => (
                <div
                    key={index}
                    className="flex h-full min-h-0 min-w-72 flex-col p-2"
                >
                    <div className="mb-2 shrink-0">
                        <div className="mb-1.5 flex flex-col">
                            <span className="text-[13px] font-semibold leading-none text-foreground">
                                {elem.day}
                            </span>
                            <span className="mt-1 text-[11px] leading-none text-muted-foreground">
                                {elem.date}
                            </span>
                        </div>
                        <Input
                            placeholder="Добавить задачу"
                            className="h-9 border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="scrollbar-hover-overlay min-h-0 flex-1 pt-1">
                        {tasks
                            ?.filter((task) => task.columnId === elem.columnId)
                            .sort(
                                (a, b) =>
                                    Number(a.position ?? 0) -
                                    Number(b.position ?? 0),
                            )
                            .map((task) => (
                                <Card
                                    ref={ref}
                                    key={task.id}
                                    onClick={() => {
                                        if (draggingTaskId) return;
                                        handleOpen(task);
                                    }}
                                    className={cn(
                                        'relative mb-3 cursor-grab border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md',
                                        draggingTaskId === task.id &&
                                            'opacity-50',
                                        overTaskId === task.id &&
                                            overColumnId === elem.columnId &&
                                            'border-accent/70 bg-accent/5',
                                        overTaskId === task.id &&
                                            overColumnId === elem.columnId &&
                                            dropPosition === 'before' &&
                                            'before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-accent',
                                        overTaskId === task.id &&
                                            overColumnId === elem.columnId &&
                                            dropPosition === 'after' &&
                                            'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent',
                                    )}
                                >
                                    <CardHeader>
                                        <CardTitle>{task.title}</CardTitle>
                                        <CardDescription>
                                            {task.project}
                                        </CardDescription>
                                        <CardAction>
                                            <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-medium text-accent-foreground">
                                                {task.dueInDays} дн.
                                            </span>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>#{task.id}</span>
                                            <span className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
                                                {task.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-wrap gap-2">
                                        {task.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-md bg-sidebar px-2 py-1 text-[10px] font-medium text-sidebar-foreground"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </CardFooter>
                                </Card>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Board;
