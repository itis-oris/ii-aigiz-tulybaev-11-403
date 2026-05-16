'use client';

import { useMemo } from 'react';
import { type Task } from '@/views/home/model/task';
import { useMonthBoardDnd } from '@/views/home/model/use-month-board-dnd';
import {
    buildCalendarCells,
    getTaskMonth,
    splitCellsIntoWeeks,
} from './month-board.lib';
import MonthBoardGrid from './month-board-grid';
import type { MonthBoardProps } from './month-board.types';

const MonthBoard = ({
    tasks,
    anchorDate,
    setIsOpen,
    setSelectedTask,
    settings,
}: MonthBoardProps) => {
    const monthStart = useMemo(
        () =>
            anchorDate
                ? new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
                : getTaskMonth(tasks),
        [anchorDate, tasks],
    );
    const {
        monthDays,
        draggingTaskId,
        overDateKey,
        overTaskId,
        dropPosition,
        handleDragStart,
        handleDragMove,
        handleDragOver,
        handleDragEnd,
    } = useMonthBoardDnd(tasks, monthStart);
    const cells = useMemo(
        () => buildCalendarCells(monthDays, monthStart),
        [monthDays, monthStart],
    );
    const weeks = useMemo(() => splitCellsIntoWeeks(cells), [cells]);

    const handleOpen = (task: Task) => {
        setIsOpen(true);
        setSelectedTask(task);
    };

    return (
        <MonthBoardGrid
            monthStart={monthStart}
            weeks={weeks}
            draggingTaskId={draggingTaskId}
            overDateKey={overDateKey}
            overTaskId={overTaskId}
            dropPosition={dropPosition}
            onOpen={handleOpen}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            settings={settings}
        />
    );
};

export default MonthBoard;
