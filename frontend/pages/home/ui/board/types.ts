import type { DayTasks } from '@/pages/home/model/task';

export type Column = Pick<DayTasks, 'day' | 'date' | 'columnId' | 'tasks'>;
