'use client';

import { ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Button, Input } from '@/shared/ui';
import type { TaskGroup } from '@/views/my-tasks/model';
import { myTasksGridClassName } from './constants';
import MyTasksTaskRow from './my-tasks-task-row';

type MyTasksGroupSectionProps = {
    group: TaskGroup;
    isExpanded: boolean;
    selectedTaskId?: string | null;
    onToggle?: () => void;
    onSelectTask?: (taskId: string) => void;
    onToggleTaskComplete?: (taskId: string) => void;
    isCreatingTask?: boolean;
    taskDraft?: string;
    onStartCreateTask?: () => void;
    onTaskDraftChange?: (value: string) => void;
    onSubmitTask?: () => void;
    onCancelCreateTask?: () => void;
};

const MyTasksGroupSection = ({
    group,
    isExpanded,
    selectedTaskId,
    onToggle,
    onSelectTask,
    onToggleTaskComplete,
    isCreatingTask = false,
    taskDraft = '',
    onStartCreateTask,
    onTaskDraftChange,
    onSubmitTask,
    onCancelCreateTask,
}: MyTasksGroupSectionProps) => {
    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className="flex h-10 w-full items-center gap-2 border-b border-border/70 px-4 text-left"
            >
                {isExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground/80">
                    {group.title}
                </span>
            </button>

            {isExpanded ? (
                <>
                    {group.showCreate ? (
                        <div
                            className={cn(
                                myTasksGridClassName,
                                'min-h-10 border-b border-border/70 px-6 py-2 text-sm text-muted-foreground',
                            )}
                        >
                            <div className="col-span-full flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onStartCreateTask}
                                    className="flex cursor-pointer items-center gap-2.5 transition-colors hover:text-foreground"
                                >
                                    <PlusCircle className="size-4" />
                                    <span>Новая задача</span>
                                </button>
                                {isCreatingTask ? (
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <Input
                                            value={taskDraft}
                                            onChange={(event) =>
                                                onTaskDraftChange?.(
                                                    event.target.value,
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    onSubmitTask?.();
                                                }

                                                if (event.key === 'Escape') {
                                                    event.preventDefault();
                                                    onCancelCreateTask?.();
                                                }
                                            }}
                                            uiSize="md"
                                            placeholder="Название задачи"
                                            className="max-w-md bg-background"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={onSubmitTask}
                                            disabled={!taskDraft.trim()}
                                        >
                                            Добавить
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={onCancelCreateTask}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {group.rows.map((task) => (
                        <MyTasksTaskRow
                            key={task.id}
                            task={task}
                            isSelected={selectedTaskId === task.id}
                            onSelect={() => onSelectTask?.(task.id)}
                            onToggleComplete={() =>
                                onToggleTaskComplete?.(task.id)
                            }
                        />
                    ))}
                </>
            ) : null}
        </div>
    );
};

export default MyTasksGroupSection;
export type { MyTasksGroupSectionProps };
