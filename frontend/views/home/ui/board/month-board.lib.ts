import { type DayTasks, type Task } from '@/views/home/model/task';
import type { CalendarCell } from './month-board.types';

export const weekDayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
});

export const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
});

export const normalizeDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const sortTasks = (tasks: Task[]) =>
    [...tasks].sort(
        (left, right) =>
            Number(left.position ?? 0) - Number(right.position ?? 0),
    );

export const getTaskMonth = (tasks: Task[]) => {
    const monthCounts = new Map<string, number>();

    for (const task of tasks) {
        if (!task.dueDate) {
            continue;
        }

        const date = new Date(task.dueDate);

        if (Number.isNaN(date.getTime())) {
            continue;
        }

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
    }

    const [topMonthKey] =
        [...monthCounts.entries()].sort(
            (left, right) => right[1] - left[1],
        )[0] ?? [];

    if (!topMonthKey) {
        const today = new Date();

        return new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const [year, month] = topMonthKey.split('-').map(Number);

    return new Date(year, month, 1);
};

export const getCalendarStart = (monthStart: Date) => {
    const result = new Date(monthStart);
    const day = result.getDay();
    const offset = day === 0 ? 6 : day - 1;

    result.setDate(result.getDate() - offset);

    return result;
};

const getCalendarDayCount = (monthStart: Date) => {
    const firstWeekDay = monthStart.getDay() === 0 ? 7 : monthStart.getDay();
    const daysInMonth = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0,
    ).getDate();

    return Math.ceil((firstWeekDay - 1 + daysInMonth) / 7) * 7;
};

const withDateKey = (task: Task, dateKey: string) => {
    const baseDate = task.dueDate ? new Date(task.dueDate) : new Date();

    if (Number.isNaN(baseDate.getTime())) {
        return task;
    }

    const [year, month, day] = dateKey.split('-').map(Number);
    const nextDueDate = new Date(baseDate);
    nextDueDate.setFullYear(year, month - 1, day);

    return {
        ...task,
        dueDate: nextDueDate.toISOString(),
        columnId: dateKey,
    };
};

export const normalizeColumnTasks = (tasks: Task[], columnId: string) =>
    tasks.map((task, index) => ({
        ...withDateKey(task, columnId),
        position: String((index + 1) * 1000),
    }));

export const createMonthDays = (
    tasks: Task[],
    monthStart: Date,
): DayTasks[] => {
    const taskMap = new Map<string, Task[]>();

    for (const task of tasks) {
        if (!task.dueDate) {
            continue;
        }

        const date = new Date(task.dueDate);

        if (Number.isNaN(date.getTime())) {
            continue;
        }

        const key = normalizeDateKey(date);
        const dayTasks = taskMap.get(key) ?? [];
        dayTasks.push(task);
        taskMap.set(key, dayTasks);
    }

    const firstCell = getCalendarStart(monthStart);
    const dayCount = getCalendarDayCount(monthStart);

    return Array.from({ length: dayCount }, (_, index) => {
        const date = new Date(firstCell);
        date.setDate(firstCell.getDate() + index);
        const dateKey = normalizeDateKey(date);

        return {
            day: String(date.getDate()),
            date: dayFormatter.format(date),
            columnId: dateKey,
            tasks: normalizeColumnTasks(taskMap.get(dateKey) ?? [], dateKey),
        };
    });
};

export const buildCalendarCells = (
    monthDays: DayTasks[],
    monthStart: Date,
): CalendarCell[] =>
    monthDays.map((day, index) => {
        const firstCell = getCalendarStart(monthStart);
        const date = new Date(firstCell);
        date.setDate(firstCell.getDate() + index);

        return {
            date,
            dateKey: day.columnId,
            isCurrentMonth: date.getMonth() === monthStart.getMonth(),
            tasks: sortTasks(day.tasks),
        };
    });

export const splitCellsIntoWeeks = (cells: CalendarCell[]) => {
    const weeks: CalendarCell[][] = [];

    for (let index = 0; index < cells.length; index += 7) {
        weeks.push(cells.slice(index, index + 7));
    }

    return weeks;
};
