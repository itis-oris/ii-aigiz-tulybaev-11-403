import { CheckCircle2, Circle, FolderKanban } from 'lucide-react';
import { Avatar, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib';
import { getTagBadgeStyle } from '@/shared/lib/tag-color/index';
import type { Assignee, TaskRow } from '@/views/my-tasks/model';
import { myTasksGridClassName } from './constants';

type MyTasksTaskRowProps = {
    task: TaskRow;
    isSelected?: boolean;
    onSelect?: () => void;
    onToggleComplete?: () => void;
};

function TaskStatusIcon({ completed }: { completed?: boolean }) {
    if (completed) {
        return <CheckCircle2 className="size-4 text-emerald-500" />;
    }

    return <Circle className="size-4 text-muted-foreground" />;
}

function AssigneesCell({ assignees }: { assignees?: Assignee[] }) {
    if (!assignees?.length) {
        return null;
    }

    if (assignees.length === 1) {
        const assignee = assignees[0];

        return (
            <div className="flex items-center gap-2">
                <Avatar size="xs" className={assignee.className}>
                    {assignee.initials}
                </Avatar>
                <span className="truncate text-sm">{assignee.name}</span>
            </div>
        );
    }

    const visibleAssignees = assignees.slice(0, 3);
    const extraCount = assignees.length - visibleAssignees.length;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {visibleAssignees.map((assignee, index) => (
                    <Avatar
                        key={`${assignee.name}-${index}`}
                        size="xs"
                        className={cn(
                            'border border-background',
                            assignee.className,
                            index > 0 && '-ml-1.5',
                        )}
                    >
                        {assignee.initials}
                    </Avatar>
                ))}
            </div>
            {extraCount > 0 ? (
                <span className="text-xs text-muted-foreground">
                    +{extraCount}
                </span>
            ) : null}
        </div>
    );
}

const MyTasksTaskRow = ({
    task,
    isSelected = false,
    onSelect,
    onToggleComplete,
}: MyTasksTaskRowProps) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect?.();
                }
            }}
            className={cn(
                myTasksGridClassName,
                'min-h-10 cursor-pointer border-b border-border/70 px-6 py-2 text-sm text-foreground transition-colors hover:bg-muted/40',
                isSelected && 'bg-muted/60',
                task.completed && 'text-muted-foreground',
            )}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <button
                    type="button"
                    aria-label={
                        task.completed
                            ? 'Пометить как незавершённую'
                            : 'Пометить как завершённую'
                    }
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleComplete?.();
                    }}
                    className="cursor-pointer rounded-full text-left transition-transform hover:scale-105"
                >
                    <TaskStatusIcon completed={task.completed} />
                </button>
                <span
                    className={cn('truncate', task.completed && 'line-through')}
                >
                    {task.title}
                </span>
            </div>

            <div>
                {task.number ? (
                    <Badge
                        variant="subtle"
                        size="sm"
                        className="bg-muted text-muted-foreground"
                    >
                        {task.number}
                    </Badge>
                ) : null}
            </div>

            <div className="min-w-0">
                <AssigneesCell assignees={task.assignees} />
            </div>

            <div className="flex min-w-0 items-center gap-2">
                <Avatar
                    size="xs"
                    shape="square"
                    className="bg-amber-100 text-amber-700"
                >
                    <FolderKanban className="size-3.5" />
                </Avatar>
                <span className="truncate text-sm">{task.project}</span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-sm">
                {task.boardMark ? (
                    <Badge
                        variant="subtle"
                        size="sm"
                        className="min-w-5 justify-center px-1.5"
                    >
                        {task.boardMark}
                    </Badge>
                ) : null}
                <span className="truncate">{task.board}</span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-sm">
                {task.columnMark ? (
                    <Badge
                        variant="subtle"
                        size="sm"
                        className="min-w-5 justify-center px-1.5"
                    >
                        {task.columnMark}
                    </Badge>
                ) : null}
                <span className="truncate">{task.column}</span>
            </div>

            <div className="text-sm">{task.date}</div>
            <div className="text-sm">{task.priority}</div>

            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                {task.tags?.map((tag) => (
                    <Badge
                        key={tag.id}
                        size="sm"
                        variant="outline"
                        className="shrink-0 font-medium"
                        style={getTagBadgeStyle(tag.color)}
                    >
                        {tag.label}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default MyTasksTaskRow;
export type { MyTasksTaskRowProps };
