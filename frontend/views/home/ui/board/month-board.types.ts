import { type Task } from '@/views/home/model/task';
import type { HomeHeaderSettingsValue } from '@/views/home/ui/home-header/home-header.types';

export type MonthBoardProps = {
    tasks: Task[];
    anchorDate?: Date;
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
    settings?: HomeHeaderSettingsValue;
};

export type CalendarCell = {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
    tasks: Task[];
};
