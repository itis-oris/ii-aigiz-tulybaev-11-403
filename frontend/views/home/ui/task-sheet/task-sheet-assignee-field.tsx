import { useState } from 'react';
import { Check, ChevronDown, LoaderCircle } from 'lucide-react';
import { Avatar, Badge, Button } from '@/shared/ui';
import { Input } from '@/shared/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import type { Task } from '@/views/home/model/task';
import type { TaskSheetAssigneeOption } from './task-sheet.types';
import {
    getDisplayNameFromEmail,
    getInitials,
    renderAvatarContent,
} from './task-sheet.lib';
import { TaskSheetMetaRow } from './task-sheet-meta-row';

export const TaskSheetAssigneeField = ({
    resolvedTask,
    availableAssignees,
    isAssigneesRefreshing,
    isAssigningTask,
    onAssignTask,
}: {
    resolvedTask: Task;
    availableAssignees: TaskSheetAssigneeOption[];
    isAssigneesRefreshing: boolean;
    isAssigningTask: boolean;
    onAssignTask: (assigneeId: string | null) => void;
}) => {
    const [selectedAssigneeId, setSelectedAssigneeId] = useState(
        resolvedTask.assigneeId ?? '',
    );
    const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);
    const [assigneeQuery, setAssigneeQuery] = useState('');

    const filteredAssignees = availableAssignees.filter((assignee) => {
        const query = assigneeQuery.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            assignee.label.toLowerCase().includes(query) ||
            assignee.email.toLowerCase().includes(query)
        );
    });
    const selectedAssignee = availableAssignees.find(
        (assignee) => assignee.id === selectedAssigneeId,
    );
    const currentAssignee =
        selectedAssignee ??
        availableAssignees.find(
            (assignee) => assignee.id === resolvedTask.assigneeId,
        ) ??
        null;

    const handleAssigneeChange = (value: string) => {
        setSelectedAssigneeId(value);
        onAssignTask(value || null);
        setIsAssigneePopoverOpen(false);
        setAssigneeQuery('');
    };

    return (
        <TaskSheetMetaRow label="Исполнитель">
            <div className="flex flex-1 flex-wrap items-center gap-3">
                <Avatar
                    size="xl"
                    className="bg-sidebar text-sidebar-foreground"
                >
                    {renderAvatarContent({
                        avatarUrl: currentAssignee?.avatarUrl,
                        fallback: getInitials(
                            currentAssignee?.label ??
                                resolvedTask.assigneeEmail,
                        ),
                    })}
                </Avatar>
                <div className="min-w-52 flex-1">
                    <div className="text-sm font-medium text-foreground">
                        {currentAssignee?.label ??
                            getDisplayNameFromEmail(resolvedTask.assigneeEmail)}
                    </div>
                    {currentAssignee?.email &&
                    currentAssignee.label !== currentAssignee.email ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                            {currentAssignee.email}
                        </div>
                    ) : null}
                    <div className="mt-1 text-xs text-muted-foreground">
                        Назначенный исполнитель
                    </div>
                </div>
                <div className="min-w-64 flex-1">
                    <Popover
                        open={isAssigneePopoverOpen}
                        onOpenChange={setIsAssigneePopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                disabled={
                                    isAssigningTask || isAssigneesRefreshing
                                }
                                className="h-10 w-full justify-between"
                            >
                                <span className="truncate text-left">
                                    {selectedAssignee
                                        ? selectedAssignee.label
                                        : 'Не назначен'}
                                </span>
                                <ChevronDown className="size-4 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[22rem] p-0">
                            <div className="border-b border-border p-3">
                                <Input
                                    value={assigneeQuery}
                                    onChange={(event) =>
                                        setAssigneeQuery(event.target.value)
                                    }
                                    placeholder="Поиск по имени или email"
                                    uiSize="md"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-80 overflow-y-auto p-2">
                                <button
                                    type="button"
                                    onClick={() => handleAssigneeChange('')}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                >
                                    <Avatar
                                        size="md"
                                        className="bg-muted text-muted-foreground"
                                    >
                                        NA
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-foreground">
                                            Не назначен
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            Снять исполнителя
                                        </div>
                                    </div>
                                    {!selectedAssigneeId ? (
                                        <Check className="size-4 text-foreground" />
                                    ) : null}
                                </button>
                                {filteredAssignees.length > 0 ? (
                                    filteredAssignees.map((assignee) => (
                                        <button
                                            key={assignee.id}
                                            type="button"
                                            onClick={() =>
                                                handleAssigneeChange(
                                                    assignee.id,
                                                )
                                            }
                                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                        >
                                            <Avatar
                                                size="md"
                                                className="bg-sidebar text-sidebar-foreground"
                                            >
                                                {renderAvatarContent({
                                                    avatarUrl:
                                                        assignee.avatarUrl,
                                                    fallback: getInitials(
                                                        assignee.label,
                                                    ),
                                                })}
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-medium text-foreground">
                                                    {assignee.label}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {assignee.email}
                                                </div>
                                            </div>
                                            {selectedAssigneeId ===
                                            assignee.id ? (
                                                <Check className="size-4 text-foreground" />
                                            ) : null}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                        Никого не найдено
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {isAssigningTask ? (
                    <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                ) : null}
                {isAssigneesRefreshing ? (
                    <Badge variant="outline" size="sm">
                        Обновление списка
                    </Badge>
                ) : null}
            </div>
        </TaskSheetMetaRow>
    );
};
