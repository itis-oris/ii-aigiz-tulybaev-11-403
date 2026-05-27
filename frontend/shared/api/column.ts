import { apiClient } from './client';

export type ColumnResponse = {
    id: string;
    name: string;
    position: number | null;
    boardId: string;
    boardName: string;
    deletedAt: string | null;
};

export function getColumns(boardId: string) {
    return apiClient<ColumnResponse[]>(
        `/api/columns?boardId=${encodeURIComponent(boardId)}`,
    );
}
