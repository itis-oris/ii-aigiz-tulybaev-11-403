import { apiClient } from './client';
import type { TagResponse } from './tag';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskResponse = {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    storyPoints: number | null;
    priority: number | null;
    dueDate: string | null;
    isPrivate: boolean | null;
    position: number | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    projectId: string | null;
    projectName: string | null;
    boardId: string | null;
    boardName: string | null;
    columnId: string | null;
    columnName: string | null;
    assigneeId: string | null;
    assigneeEmail: string | null;
    creatorId: string | null;
    creatorEmail: string | null;
    tags: TagResponse[];
};

export type TaskFilterRequest = {
    projectId?: string;
    assigneeId?: string;
    creatorId?: string;
    isPrivate?: boolean;
    status?: TaskStatus;
    priority?: number;
    search?: string;
};

export type CreateTaskRequest = {
    title: string;
    description?: string;
    storyPoints?: number;
    priority?: number;
    dueDate?: string;
    isPrivate?: boolean;
    projectId: string;
    boardId: string;
    columnId: string;
    assigneeId?: string;
    tagIds?: string[];
    position?: number;
};

export type UpdateTaskRequest = {
    title?: string;
    description?: string;
    storyPoints?: number;
    priority?: number;
    dueDate?: string;
    isPrivate?: boolean;
    projectId?: string;
    boardId?: string;
    columnId?: string;
    assigneeId?: string;
    tagIds?: string[];
    position?: number;
};

export type UpdateTaskStatusRequest = {
    status: TaskStatus;
};

export type AssignTaskRequest = {
    assigneeId: string | null;
};

export type MoveTaskRequest = {
    columnId: string;
    position?: number;
};

export function getTasks(filters: TaskFilterRequest = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();

    return apiClient<TaskResponse[]>(`/api/tasks${query ? `?${query}` : ''}`);
}

export function getTask(taskId: string) {
    return apiClient<TaskResponse>(`/api/tasks/${taskId}`);
}

export function createTask(payload: CreateTaskRequest) {
    return apiClient<TaskResponse>('/api/tasks', {
        method: 'POST',
        body: payload,
    });
}

export function updateTask(taskId: string, payload: UpdateTaskRequest) {
    return apiClient<TaskResponse>(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: payload,
    });
}

export function updateTaskStatus(
    taskId: string,
    payload: UpdateTaskStatusRequest,
) {
    return apiClient<TaskResponse>(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: payload,
    });
}

export function assignTask(taskId: string, payload: AssignTaskRequest) {
    return apiClient<TaskResponse>(`/api/tasks/${taskId}/assign`, {
        method: 'PATCH',
        body: payload,
    });
}

export function deleteTask(taskId: string) {
    return apiClient<null>(`/api/tasks/${taskId}`, {
        method: 'DELETE',
    });
}

export function moveTask(taskId: string, payload: MoveTaskRequest) {
    return apiClient<TaskResponse>(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        body: payload,
    });
}
