import { useMemo, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { type DayTasks, type Task } from '@/views/home/model/task';
import { Button, Input } from '@/shared/ui';
import Board from './Board';

type TasksBoardProps = {
    tasks: Task[];
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
    onCreateTask?: (columnId: string, title: string) => void;
};

const boardModeColumns = [
    { day: 'К выполнению', date: 'todo', columnId: 'todo' },
    { day: 'В работе', date: 'in progress', columnId: 'in progress' },
    { day: 'На проверке', date: 'review', columnId: 'review' },
] as const;

const statusLabels: Record<(typeof boardModeColumns)[number]['date'], string> =
    {
        todo: 'Новые задачи',
        'in progress': 'Активные задачи',
        review: 'Проверка и согласование',
    };

const getTaskCountLabel = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return `${count} задача`;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} задачи`;
    }

    return `${count} задач`;
};

const TasksBoard = ({
    tasks,
    setIsOpen,
    setSelectedTask,
    onCreateTask,
}: TasksBoardProps) => {
    const [customColumns, setCustomColumns] = useState<
        Array<{ day: string; date: string; columnId: string }>
    >([]);
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');

    const days = useMemo<DayTasks[]>(
        () =>
            [...boardModeColumns, ...customColumns].map((column) => {
                const columnTasks = tasks
                    .filter((task) =>
                        column.date in statusLabels
                            ? task.status === column.date
                            : task.columnId === column.columnId,
                    )
                    .map((task, index) => ({
                        ...task,
                        columnId: column.columnId,
                        position: String((index + 1) * 1000),
                    }));

                return {
                    day: column.day,
                    date:
                        column.date in statusLabels
                            ? `${getTaskCountLabel(columnTasks.length)} · ${statusLabels[column.date as keyof typeof statusLabels]}`
                            : `${getTaskCountLabel(columnTasks.length)} · Пользовательская колонка`,
                    columnId: column.columnId,
                    tasks: columnTasks,
                };
            }),
        [customColumns, tasks],
    );

    const handleCreateColumn = () => {
        const trimmedName = newColumnName.trim();

        if (!trimmedName) {
            return;
        }

        const columnId = `custom-${Date.now()}`;

        setCustomColumns((currentColumns) => [
            ...currentColumns,
            {
                day: trimmedName,
                date: columnId,
                columnId,
            },
        ]);
        setNewColumnName('');
        setIsCreatingColumn(false);
    };

    const extraColumn = (
        <div className="min-w-72 px-2">
            {isCreatingColumn ? (
                <div className="flex h-full min-h-0 flex-col rounded-xl border border-dashed border-border bg-card/60 p-3">
                    <div className="mb-3">
                        <div className="text-[13px] font-semibold text-foreground">
                            Новая колонка
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            Укажите название колонки для режима доски.
                        </div>
                    </div>
                    <Input
                        value={newColumnName}
                        onChange={(event) =>
                            setNewColumnName(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleCreateColumn();
                            }

                            if (event.key === 'Escape') {
                                setIsCreatingColumn(false);
                                setNewColumnName('');
                            }
                        }}
                        placeholder="Например, Готово к релизу"
                        uiSize="md"
                        autoFocus
                    />
                    <div className="mt-3 flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateColumn}
                            disabled={!newColumnName.trim()}
                        >
                            <Check className="size-3.5" />
                            Создать
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsCreatingColumn(false);
                                setNewColumnName('');
                            }}
                        >
                            <X className="size-3.5" />
                            Отмена
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsCreatingColumn(true)}
                    className="flex h-full min-h-40 w-full items-start rounded-xl border border-dashed border-border bg-card/40 p-3 text-left transition-colors hover:border-ring hover:bg-accent/5"
                >
                    <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
                        <Plus className="size-4" />
                        Создать колонку
                    </span>
                </button>
            )}
        </div>
    );

    return (
        <Board
            days={days}
            setIsOpen={setIsOpen}
            setSelectedTask={setSelectedTask}
            extraColumn={extraColumn}
            onCreateTask={onCreateTask}
        />
    );
};

export default TasksBoard;
