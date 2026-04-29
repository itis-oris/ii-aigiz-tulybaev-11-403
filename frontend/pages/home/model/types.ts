export type Task = {
    id: number;
    title: string;
    description?: string;
    storyPoints?: number;
    priority?: number;
    dueDate?: string;
    columnId: string;
    position?: string;
    projectId?: string;
    boardId?: string;
    assigneeId?: string;
    project: string;
    dueInDays: number;
    status: string;
    tags: string[];
};

export type DayTasks = {
    day: string;
    date: string;
    columnId: string;
    tasks: Task[];
};
