import { apiClient } from './client';

export type BoardResponse = {
    id: string;
    name: string;
    position: number | null;
    projectId: string;
    projectName: string;
    createdAt: string;
    deletedAt: string | null;
};

export type CreateBoardRequest = {
    name: string;
    projectId: string;
    position?: number;
};

export function getBoards(projectId: string) {
    return apiClient<BoardResponse[]>(
        `/api/boards?projectId=${encodeURIComponent(projectId)}`,
    );
}

export function createBoard(payload: CreateBoardRequest) {
    return apiClient<BoardResponse>('/api/boards', {
        method: 'POST',
        body: payload,
    });
}

export function deleteBoard(boardId: string) {
    return apiClient<null>(`/api/boards/${boardId}`, {
        method: 'DELETE',
    });
}
