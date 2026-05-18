import type { TaskStatus } from '@/shared/api';
import type { TagResponse } from '@/shared/api/tag';
import type { Task } from '@/views/home/model/task';

export interface SheetProps {
    isOpen: boolean;
    selectedTask: Task | null;
    setIsOpen: (open: boolean) => void;
    setSelectedTask: (task: Task | null) => void;
}

export type TaskSheetTagOption = {
    id: string;
    name: string;
    color: string;
    system?: boolean;
};

export type TaskSheetAssigneeOption = {
    id: string;
    email: string;
    label: string;
    avatarUrl?: string | null;
};

export type TaskSheetCommentItem = {
    id: string;
    text: string;
    createdAt: string;
    userId: string;
    userEmail: string | null;
};

export type TaskSheetBodyProps = {
    resolvedTask: Task;
    selectedTaskId: string;
    taskQueryError: Error | null;
    isTaskRefreshing: boolean;
    resolvedApiStatus: TaskStatus;
    isUpdatingStatus: boolean;
    statusUpdateTarget?: TaskStatus;
    statusUpdateError: Error | null;
    onUpdateStatus: (status: TaskStatus) => void;
    onSaveTask: (payload: {
        title: string;
        description?: string;
        storyPoints?: number;
        priority?: number;
        dueDate?: string;
        isPrivate: boolean;
        tagIds: string[];
    }) => void;
    onSaveTags: (tagIds: string[]) => void;
    isSavingTask: boolean;
    isSavingTags: boolean;
    saveTaskError: Error | null;
    saveTagsError: Error | null;
    availableTags: TaskSheetTagOption[];
    isTagsRefreshing: boolean;
    tagsError: Error | null;
    isCreatingTag: boolean;
    createTagError: Error | null;
    onCreateTag: (payload: {
        name: string;
        color: string;
    }) => Promise<TagResponse>;
    comments: TaskSheetCommentItem[];
    availableAssignees: TaskSheetAssigneeOption[];
    isAssigneesRefreshing: boolean;
    assigneesError: Error | null;
    isAssigningTask: boolean;
    assignTaskError: Error | null;
    onAssignTask: (assigneeId: string | null) => void;
    isCommentsRefreshing: boolean;
    commentsError: Error | null;
    commentDraft: string;
    onCommentDraftChange: (value: string) => void;
    isCommentSubmitDisabled: boolean;
    isCreatingComment: boolean;
    onSubmitComment: () => void;
    currentUserId?: string;
};
