'use client';

import type { TaskGroup } from '@/views/my-tasks/model';
import { cn } from '@/shared/lib';
import { myTasksGridClassName } from './constants';
import MyTasksGroupSection from './my-tasks-group-section';

type MyTasksTableProps = {
    groups: TaskGroup[];
    expandedGroupIds: string[];
    selectedTaskId?: string | null;
    onToggleGroup?: (groupId: string) => void;
    onSelectTask?: (groupId: string, taskId: string) => void;
    onToggleTaskComplete?: (groupId: string, taskId: string) => void;
    creatingGroupId?: string | null;
    taskDraft?: string;
    onStartCreateTask?: (groupId: string) => void;
    onTaskDraftChange?: (value: string) => void;
    onSubmitTask?: (groupId: string) => void;
    onCancelCreateTask?: () => void;
};

const MyTasksTable = ({
    groups,
    expandedGroupIds,
    selectedTaskId,
    onToggleGroup,
    onSelectTask,
    onToggleTaskComplete,
    creatingGroupId,
    taskDraft,
    onStartCreateTask,
    onTaskDraftChange,
    onSubmitTask,
    onCancelCreateTask,
}: MyTasksTableProps) => {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-[1380px]">
                <div
                    className={cn(
                        myTasksGridClassName,
                        'border-b border-border px-6 pb-3 text-sm text-muted-foreground',
                    )}
                >
                    <div>Наименование</div>
                    <div>Номер</div>
                    <div>Исполнитель</div>
                    <div>Проект</div>
                    <div>Доска</div>
                    <div>Колонка</div>
                    <div>Дата</div>
                    <div>Приоритет</div>
                    <div>Теги</div>
                </div>

                <div>
                    {groups.map((group) => (
                        <MyTasksGroupSection
                            key={group.id}
                            group={group}
                            isExpanded={expandedGroupIds.includes(group.id)}
                            selectedTaskId={selectedTaskId}
                            onToggle={() => onToggleGroup?.(group.id)}
                            onSelectTask={(taskId) =>
                                onSelectTask?.(group.id, taskId)
                            }
                            onToggleTaskComplete={(taskId) =>
                                onToggleTaskComplete?.(group.id, taskId)
                            }
                            isCreatingTask={creatingGroupId === group.id}
                            taskDraft={
                                creatingGroupId === group.id ? taskDraft : ''
                            }
                            onStartCreateTask={() =>
                                onStartCreateTask?.(group.id)
                            }
                            onTaskDraftChange={onTaskDraftChange}
                            onSubmitTask={() => onSubmitTask?.(group.id)}
                            onCancelCreateTask={onCancelCreateTask}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyTasksTable;
export type { MyTasksTableProps };
