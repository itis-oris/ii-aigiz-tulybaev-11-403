import { type Task } from '@/views/home/model/task';

export type MonthBoardProps = {
    tasks: Task[];
    anchorDate?: Date;
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
};

export type CalendarCell = {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
    tasks: Task[];
};
