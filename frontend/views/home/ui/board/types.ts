import type { DayTasks } from '@/views/home/model/task';

export type Column = Pick<DayTasks, 'day' | 'date' | 'columnId' | 'tasks'>;
