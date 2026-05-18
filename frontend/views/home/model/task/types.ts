export type TaskTag = {
    id: string;
    name: string;
    color: string;
    system?: boolean;
    projectId?: string;
    projectName?: string;
};

export type Task = {
    id: string | number;
    title: string;
    description?: string;
    storyPoints?: number;
    priority?: number;
    dueDate?: string;
    isPrivate?: boolean;
    columnId: string;
    position?: string;
    projectId?: string;
    boardId?: string;
    assigneeId?: string;
    projectSlug?: string;
    project: string;
    dueInDays: number;
    status: string;
    tags: TaskTag[];
    boardName?: string;
    columnName?: string;
    assigneeEmail?: string;
    creatorId?: string;
    creatorEmail?: string;
};

export type DayTasks = {
    day: string;
    date: string;
    columnId: string;
    tasks: Task[];
};
