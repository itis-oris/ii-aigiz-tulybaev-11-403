import { useMemo, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { type DayTasks, type Task } from '@/views/home/model/task';
import { Button, Input } from '@/shared/ui';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';
import Board from './Board';

type TaskBoardColumn = {
    id: string;
    name: string;
};

type TasksBoardProps = {
    tasks: Task[];
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
    onCreateTask?: (
        columnId: string,
        title: string,
        isPrivate: boolean,
    ) => void;
    onMoveTask?: (payload: {
        taskId: string;
        columnId: string;
        position: number;
    }) => void;
    settings?: HomeHeaderSettingsValue;
    columns?: TaskBoardColumn[];
};

const fallbackBoardModeColumns = [
    { day: 'К выполнению', date: 'todo', columnId: 'todo' },
    { day: 'В работе', date: 'in progress', columnId: 'in progress' },
    { day: 'Готово', date: 'done', columnId: 'done' },
] as const;

const fallbackColumnDescriptions: Record<
    (typeof fallbackBoardModeColumns)[number]['date'],
    string
> = {
    todo: 'Новые задачи',
    'in progress': 'Активные задачи',
    done: 'Завершенные задачи',
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
    onMoveTask,
    settings,
    columns,
}: TasksBoardProps) => {
    const [customColumns, setCustomColumns] = useState<
        Array<{ day: string; date: string; columnId: string }>
    >([]);
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');

    const days = useMemo<DayTasks[]>(() => {
        const baseColumns =
            columns && columns.length > 0
                ? columns.map((column) => ({
                      day: column.name,
                      date: column.name,
                      columnId: column.id,
                  }))
                : fallbackBoardModeColumns;

        return [...baseColumns, ...customColumns].map((column) => {
            const columnTasks = tasks
                .filter((task) =>
                    columns && columns.length > 0
                        ? task.columnId === column.columnId
                        : column.date in fallbackColumnDescriptions
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
                    columns && columns.length > 0
                        ? settings?.showTaskCounters === false
                            ? 'Колонка доски'
                            : `${getTaskCountLabel(columnTasks.length)} · Колонка доски`
                        : column.date in fallbackColumnDescriptions
                          ? settings?.showTaskCounters === false
                              ? fallbackColumnDescriptions[
                                    column.date as keyof typeof fallbackColumnDescriptions
                                ]
                              : `${getTaskCountLabel(columnTasks.length)} · ${fallbackColumnDescriptions[column.date as keyof typeof fallbackColumnDescriptions]}`
                          : settings?.showTaskCounters === false
                            ? 'Пользовательская колонка'
                            : `${getTaskCountLabel(columnTasks.length)} · Пользовательская колонка`,
                columnId: column.columnId,
                tasks: columnTasks,
            };
        });
    }, [columns, customColumns, settings?.showTaskCounters, tasks]);

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

    const effectiveExtraColumn =
        columns && columns.length > 0 ? undefined : extraColumn;

    return (
        <Board
            days={days}
            setIsOpen={setIsOpen}
            setSelectedTask={setSelectedTask}
            extraColumn={effectiveExtraColumn}
            onCreateTask={onCreateTask}
            onMoveTask={onMoveTask}
            dragEnabled={Boolean(columns && columns.length > 0)}
            settings={settings}
        />
    );
};

export default TasksBoard;
