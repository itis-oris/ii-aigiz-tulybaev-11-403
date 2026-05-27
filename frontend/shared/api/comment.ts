import { apiClient } from './client';

export type CommentResponse = {
    id: string;
    taskId: string;
    userId: string;
    userEmail: string;
    text: string;
    createdAt: string;
};

export type CreateCommentRequest = {
    taskId: string;
    text: string;
};

export function getComments(taskId: string) {
    return apiClient<CommentResponse[]>(
        `/api/comments?taskId=${encodeURIComponent(taskId)}`,
    );
}

export function createComment(payload: CreateCommentRequest) {
    return apiClient<CommentResponse>('/api/comments', {
        method: 'POST',
        body: payload,
    });
}

export function deleteComment(commentId: string) {
    return apiClient<null>(`/api/comments/${commentId}`, {
        method: 'DELETE',
    });
}
