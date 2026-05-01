import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';
import { Task } from '@/pages/home/model/task';
import { Input } from '@/shared/ui/input';

interface SheetProps {
    isOpen: boolean;
    selectedTask: Task | null;
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
}

export const TaskSheet = ({
    isOpen,
    selectedTask,
    setIsOpen,
    setSelectedTask,
}: SheetProps) => {
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            setSelectedTask(null);
        }
    };

    const formatDueDate = (dueDate?: string) => {
        if (!dueDate) {
            return 'Без срока';
        }

        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dueDate));
    };

    const getAssigneeName = (assigneeId?: string) => {
        if (!assigneeId) {
            return 'Не назначен';
        }

        return `Анастасия ${assigneeId.slice(-2)}`;
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

    const getStoryPointsLabel = (storyPoints?: number) => {
        if (storyPoints === undefined) {
            return 'Без оценки';
        }

        return `${storyPoints} story points`;
    };

    const comments = selectedTask
        ? [
              {
                  id: 1,
                  author: 'Анастасия',
                  text: 'Собрала первый вариант. Нужно решить, оставляем ли более строгую типографику в шапке.',
                  time: 'Сегодня, 10:24',
                  isOwn: false,
              },
              {
                  id: 2,
                  author: 'Расиль',
                  text: 'Оставляем. Дальше можно уже двигать это в финальный макет и проверить на контраст.',
                  time: 'Сегодня, 11:02',
                  isOwn: true,
              },
          ]
        : [];

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto border-l border-border bg-background data-[side=right]:w-[48rem] data-[side=right]:max-w-[90vw] data-[side=right]:sm:w-[48rem] data-[side=right]:sm:max-w-[90vw]">
                {selectedTask && (
                    <div className="flex h-full flex-col">
                        <SheetHeader className="border-b border-border bg-muted/40">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-md bg-sidebar px-2 py-1 text-[10px] font-medium text-sidebar-foreground">
                                            #{selectedTask.id}
                                        </span>
                                        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">
                                            {selectedTask.status}
                                        </span>
                                        <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-medium text-accent-foreground">
                                            {selectedTask.dueInDays} дн.
                                        </span>
                                    </div>
                                    <SheetTitle className="text-xl leading-tight">
                                        {selectedTask.title}
                                    </SheetTitle>
                                    <SheetDescription className="max-w-md text-sm leading-6">
                                        {selectedTask.description ??
                                            'Описание задачи пока не заполнено.'}
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col gap-8 p-8">
                            <div className="flex flex-wrap gap-3">
                                <button className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                                    Выполнить
                                </button>
                                <button className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                                    Старт
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                    Описание
                                </div>
                                <div className="max-w-2xl text-sm leading-7 text-foreground">
                                    {selectedTask.description ??
                                        'Описание задачи пока не заполнено.'}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center gap-6 border-b border-border/70 pb-5">
                                    <div className="w-32 shrink-0 text-sm text-muted-foreground">
                                        Исполнитель
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-sidebar text-sm font-semibold text-sidebar-foreground">
                                            {getAssigneeName(
                                                selectedTask.assigneeId,
                                            ).charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">
                                                {getAssigneeName(
                                                    selectedTask.assigneeId,
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Назначенный исполнитель
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 border-b border-border/70 pb-5">
                                    <div className="w-32 shrink-0 text-sm text-muted-foreground">
                                        Проект
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <span className="rounded-md bg-sidebar px-2 py-1 text-xs font-medium text-sidebar-foreground">
                                            {selectedTask.project}
                                        </span>
                                        <span className="text-muted-foreground">
                                            ›
                                        </span>
                                        <span>{selectedTask.status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 border-b border-border/70 pb-5">
                                    <div className="w-32 shrink-0 text-sm text-muted-foreground">
                                        Дата
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground">
                                        <span>
                                            {formatDueDate(
                                                selectedTask.dueDate,
                                            )}
                                        </span>
                                        <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                                            {selectedTask.dueInDays} дней
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 border-b border-border/70 pb-5">
                                    <div className="w-32 shrink-0 text-sm text-muted-foreground">
                                        Оценка времени
                                    </div>
                                    <div className="text-sm text-foreground">
                                        <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                                            {getStoryPointsLabel(
                                                selectedTask.storyPoints,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 border-b border-border/70 pb-5">
                                    <div className="w-32 shrink-0 text-sm text-muted-foreground">
                                        Приоритет
                                    </div>
                                    <div className="text-sm text-foreground">
                                        {getPriorityLabel(
                                            selectedTask.priority,
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="mb-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                    Теги
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTask.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-md bg-sidebar px-2 py-1 text-xs font-medium text-sidebar-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-border pt-6">
                                <div className="mb-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                    Комментарии
                                </div>
                                <div className="mb-4 space-y-4">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className={`flex gap-3 ${comment.isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!comment.isOwn && (
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-sidebar-foreground">
                                                    {comment.author.charAt(0)}
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[80%] rounded-2xl border p-4 ${
                                                    comment.isOwn
                                                        ? 'border-accent bg-accent text-accent-foreground'
                                                        : 'border-border bg-card text-foreground'
                                                }`}
                                            >
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span
                                                        className={`text-sm font-medium ${
                                                            comment.isOwn
                                                                ? 'text-accent-foreground'
                                                                : 'text-foreground'
                                                        }`}
                                                    >
                                                        {comment.author}
                                                    </span>
                                                    <span
                                                        className={`text-xs ${
                                                            comment.isOwn
                                                                ? 'text-accent-foreground/70'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {comment.time}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-sm leading-6 ${
                                                        comment.isOwn
                                                            ? 'text-accent-foreground'
                                                            : 'text-foreground'
                                                    }`}
                                                >
                                                    {comment.text}
                                                </p>
                                            </div>
                                            {comment.isOwn && (
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                                                    {comment.author.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl border border-border bg-card p-3">
                                    <Input
                                        placeholder="Напиши комментарий..."
                                        className="border-0 bg-transparent px-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
