export type TaskTag = {
    id: string;
    label: string;
    color: string;
};

export type Assignee = {
    name: string;
    initials: string;
    className: string;
};

export type TaskRow = {
    id: string;
    title: string;
    number?: string;
    filters?: MyTasksFilter[];
    assignees?: Assignee[];
    project?: string;
    board?: string;
    boardMark?: string;
    column?: string;
    columnMark?: string;
    date?: string;
    priority?: string;
    tags?: TaskTag[];
    completed?: boolean;
};

export type TaskGroup = {
    id: string;
    title: string;
    expanded?: boolean;
    showCreate?: boolean;
    rows: TaskRow[];
};

export type MyTasksFilter = 'Назначенные мне' | 'Порученные мной';
