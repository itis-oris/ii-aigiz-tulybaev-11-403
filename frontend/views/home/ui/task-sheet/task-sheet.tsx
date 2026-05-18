import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    assignTask,
    createComment,
    createTag,
    getComments,
    getProjectMembers,
    getTask,
    getTags,
    updateTask,
    updateTaskStatus,
    type TaskResponse,
    type TaskStatus,
    type UserResponse,
} from '@/shared/api';
import type { TagResponse } from '@/shared/api/tag';
import { useAuth } from '@/shared/lib';
import { Sheet, SheetContent } from '@/shared/ui/sheet';
import { TaskSheetBody } from './task-sheet-body';
import {
    getDisplayNameFromUser,
    mapApiStatusToFrontendStatus,
    mapFrontendStatusToApiStatus,
} from './task-sheet.lib';
import type { SheetProps } from './task-sheet.types';

export const TaskSheet = ({
    isOpen,
    selectedTask,
    setIsOpen,
    setSelectedTask,
}: SheetProps) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [commentDraft, setCommentDraft] = useState('');
    const selectedTaskId = selectedTask ? String(selectedTask.id) : null;
    const projectId = selectedTask?.projectId;

    const taskQuery = useQuery({
        queryKey: ['task', selectedTaskId],
        queryFn: () => getTask(selectedTaskId as string),
        enabled: Boolean(isOpen && selectedTaskId),
    });

    const commentsQuery = useQuery({
        queryKey: ['task-comments', selectedTaskId],
        queryFn: () => getComments(selectedTaskId as string),
        enabled: Boolean(isOpen && selectedTaskId),
    });
    const assigneesQuery = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => getProjectMembers(projectId as string),
        enabled: Boolean(isOpen && projectId),
    });
    const taskTagsQuery = useQuery({
        queryKey: ['task-tags', selectedTaskId],
        queryFn: () => getTags({ taskId: selectedTaskId as string }),
        enabled: Boolean(isOpen && selectedTaskId),
    });
    const availableTagsQuery = useQuery({
        queryKey: ['project-tags', selectedTask?.projectId],
        queryFn: () =>
            getTags({ projectId: selectedTask?.projectId as string }),
        enabled: Boolean(isOpen && selectedTask?.projectId),
    });

    const createCommentMutation = useMutation({
        mutationFn: () =>
            createComment({
                taskId: selectedTaskId as string,
                text: commentDraft.trim(),
            }),
        onSuccess: async () => {
            setCommentDraft('');
            await queryClient.invalidateQueries({
                queryKey: ['task-comments', selectedTaskId],
            });
        },
    });

    const createTagMutation = useMutation({
        mutationFn: (payload: { name: string; color: string }) =>
            createTag({
                name: payload.name,
                color: payload.color,
                projectId: projectId as string,
            }),
        onSuccess: async (createdTag) => {
            queryClient.setQueryData(
                ['project-tags', projectId],
                (currentTags: typeof availableTagsQuery.data) => {
                    const nextTags = currentTags ?? [];

                    if (nextTags.some((tag) => tag.id === createdTag.id)) {
                        return nextTags;
                    }

                    return [...nextTags, createdTag];
                },
            );

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['project-tags', projectId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task-tags', selectedTaskId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task', selectedTaskId],
                }),
            ]);
        },
    });

    const buildOptimisticCustomTags = (tagIds: string[]) => {
        const sourceTags = new Map<string, TagResponse>();

        (availableTagsQuery.data ?? []).forEach((tag) => {
            sourceTags.set(tag.id, tag);
        });

        (taskTagsQuery.data ?? []).forEach((tag) => {
            if (!sourceTags.has(tag.id)) {
                sourceTags.set(tag.id, tag);
            }
        });

        (selectedTask?.tags ?? []).forEach((tag) => {
            if (!tag.system && !sourceTags.has(tag.id)) {
                sourceTags.set(tag.id, {
                    id: String(tag.id),
                    name: tag.name,
                    color: tag.color,
                    system: false,
                    projectId: tag.projectId ?? null,
                    projectName: tag.projectName ?? null,
                    createdAt: new Date().toISOString(),
                    updatedAt: null,
                    deletedAt: null,
                });
            }
        });

        return tagIds
            .map((tagId) => sourceTags.get(tagId))
            .filter((tag): tag is TagResponse => Boolean(tag));
    };

    const updateTaskStatusMutation = useMutation({
        mutationFn: (status: TaskStatus) =>
            updateTaskStatus(selectedTaskId as string, { status }),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task-tags', selectedTaskId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task', selectedTaskId],
                }),
            ]);
        },
    });

    const assignTaskMutation = useMutation({
        mutationFn: (assigneeId: string | null) =>
            assignTask(selectedTaskId as string, { assigneeId }),
        onSuccess: async (updatedTask) => {
            queryClient.setQueryData(['task', selectedTaskId], updatedTask);
            queryClient.setQueriesData(
                { queryKey: ['tasks'] },
                (currentTasks: TaskResponse[] | undefined) =>
                    currentTasks?.map((task) =>
                        task.id === selectedTaskId ? updatedTask : task,
                    ) ?? currentTasks,
            );

            if (selectedTask) {
                setSelectedTask({
                    ...selectedTask,
                    assigneeId: updatedTask.assigneeId ?? undefined,
                    assigneeEmail: updatedTask.assigneeEmail ?? undefined,
                });
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task', selectedTaskId],
                }),
            ]);
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: (payload: {
            title: string;
            description?: string;
            storyPoints?: number;
            priority?: number;
            dueDate?: string;
            isPrivate: boolean;
            tagIds: string[];
        }) => updateTask(selectedTaskId as string, payload),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['task', selectedTaskId],
                }),
            ]);
        },
    });

    const updateTaskTagsMutation = useMutation({
        mutationFn: (tagIds: string[]) =>
            updateTask(selectedTaskId as string, { tagIds }),
        onMutate: async (tagIds) => {
            const optimisticCustomTags = buildOptimisticCustomTags(tagIds);

            queryClient.setQueryData(
                ['task', selectedTaskId],
                (currentTask: TaskResponse | undefined) =>
                    currentTask
                        ? {
                              ...currentTask,
                              tags: optimisticCustomTags,
                          }
                        : currentTask,
            );

            queryClient.setQueriesData(
                { queryKey: ['tasks'] },
                (currentTasks: TaskResponse[] | undefined) =>
                    currentTasks?.map((task) =>
                        task.id === selectedTaskId
                            ? {
                                  ...task,
                                  tags: optimisticCustomTags,
                              }
                            : task,
                    ) ?? currentTasks,
            );

            if (selectedTask) {
                setSelectedTask({
                    ...selectedTask,
                    tags: [
                        ...selectedTask.tags.filter((tag) => tag.system),
                        ...optimisticCustomTags.map((tag) => ({
                            id: tag.id,
                            name: tag.name,
                            color: tag.color,
                            system: false,
                            projectId: tag.projectId ?? undefined,
                            projectName: tag.projectName ?? undefined,
                        })),
                    ],
                });
            }
        },
        onSuccess: (updatedTask) => {
            queryClient.setQueryData(['task', selectedTaskId], updatedTask);
            queryClient.setQueryData(
                ['task-tags', selectedTaskId],
                updatedTask.tags.filter((tag) => !tag.system),
            );
            queryClient.setQueriesData(
                { queryKey: ['tasks'] },
                (currentTasks: TaskResponse[] | undefined) =>
                    currentTasks?.map((task) =>
                        task.id === selectedTaskId ? updatedTask : task,
                    ) ?? currentTasks,
            );
        },
    });

    const resolvedTask = useMemo(() => {
        if (!selectedTask) {
            return null;
        }

        const liveTask = taskQuery.data;
        const liveTaskTags = taskTagsQuery.data;

        if (!liveTask) {
            return selectedTask;
        }

        return {
            ...selectedTask,
            title: liveTask.title,
            description: liveTask.description ?? selectedTask.description,
            storyPoints: liveTask.storyPoints ?? selectedTask.storyPoints,
            priority: liveTask.priority ?? selectedTask.priority,
            dueDate: liveTask.dueDate ?? selectedTask.dueDate,
            isPrivate: liveTask.isPrivate ?? selectedTask.isPrivate,
            columnId: liveTask.columnId ?? selectedTask.columnId,
            position:
                liveTask.position !== null && liveTask.position !== undefined
                    ? String(liveTask.position)
                    : selectedTask.position,
            projectId: liveTask.projectId ?? selectedTask.projectId,
            boardId: liveTask.boardId ?? selectedTask.boardId,
            assigneeId: liveTask.assigneeId ?? selectedTask.assigneeId,
            project: liveTask.projectName ?? selectedTask.project,
            status: mapApiStatusToFrontendStatus(liveTask.status),
            tags: [
                ...liveTask.tags
                    .filter((tag) => tag.system)
                    .map((tag) => ({
                        id: tag.id,
                        name: tag.name,
                        color: tag.color,
                        system: tag.system,
                        projectId: tag.projectId ?? undefined,
                        projectName: tag.projectName ?? undefined,
                    })),
                ...(
                    liveTaskTags ?? liveTask.tags.filter((tag) => !tag.system)
                ).map((tag) => ({
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    system: tag.system,
                    projectId: tag.projectId ?? undefined,
                    projectName: tag.projectName ?? undefined,
                })),
            ],
            boardName: liveTask.boardName ?? selectedTask.boardName,
            columnName: liveTask.columnName ?? selectedTask.columnName,
            assigneeEmail: liveTask.assigneeEmail ?? selectedTask.assigneeEmail,
            creatorId: liveTask.creatorId ?? selectedTask.creatorId,
            creatorEmail: liveTask.creatorEmail ?? selectedTask.creatorEmail,
        };
    }, [selectedTask, taskQuery.data, taskTagsQuery.data]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            setSelectedTask(null);
            setCommentDraft('');
        }
    };

    const comments = commentsQuery.data ?? [];
    const availableAssignees = useMemo(
        () =>
            (assigneesQuery.data ?? [])
                .map((user: UserResponse) => ({
                    id: user.id,
                    email: user.email,
                    label: getDisplayNameFromUser(user),
                    avatarUrl: user.avatarUrl,
                }))
                .sort((left, right) =>
                    left.label.localeCompare(right.label, 'ru-RU'),
                ),
        [assigneesQuery.data],
    );
    const resolvedApiStatus = taskQuery.data
        ? taskQuery.data.status
        : mapFrontendStatusToApiStatus(resolvedTask?.status);
    const isCommentSubmitDisabled =
        !selectedTaskId ||
        !commentDraft.trim() ||
        createCommentMutation.isPending;

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent className="overflow-y-auto border-l border-border bg-background data-[side=right]:w-[48rem] data-[side=right]:max-w-[90vw] data-[side=right]:sm:w-[48rem] data-[side=right]:sm:max-w-[90vw]">
                {resolvedTask ? (
                    <TaskSheetBody
                        key={`${selectedTaskId}:${taskQuery.data?.updatedAt ?? ''}`}
                        resolvedTask={resolvedTask}
                        selectedTaskId={selectedTaskId as string}
                        taskQueryError={
                            taskQuery.error instanceof Error
                                ? taskQuery.error
                                : null
                        }
                        isTaskRefreshing={taskQuery.isFetching}
                        resolvedApiStatus={resolvedApiStatus}
                        isUpdatingStatus={updateTaskStatusMutation.isPending}
                        statusUpdateTarget={updateTaskStatusMutation.variables}
                        statusUpdateError={
                            updateTaskStatusMutation.error instanceof Error
                                ? updateTaskStatusMutation.error
                                : null
                        }
                        onUpdateStatus={(status) =>
                            updateTaskStatusMutation.mutate(status)
                        }
                        onSaveTask={(payload) =>
                            updateTaskMutation.mutate(payload)
                        }
                        onSaveTags={(tagIds) =>
                            updateTaskTagsMutation.mutate(tagIds)
                        }
                        isSavingTask={updateTaskMutation.isPending}
                        isSavingTags={updateTaskTagsMutation.isPending}
                        saveTaskError={
                            updateTaskMutation.error instanceof Error
                                ? updateTaskMutation.error
                                : null
                        }
                        saveTagsError={
                            updateTaskTagsMutation.error instanceof Error
                                ? updateTaskTagsMutation.error
                                : null
                        }
                        availableTags={(availableTagsQuery.data ?? []).map(
                            (tag) => ({
                                id: tag.id,
                                name: tag.name,
                                color: tag.color,
                                system: tag.system,
                            }),
                        )}
                        isTagsRefreshing={
                            availableTagsQuery.isFetching ||
                            taskTagsQuery.isFetching
                        }
                        tagsError={
                            availableTagsQuery.error instanceof Error
                                ? availableTagsQuery.error
                                : taskTagsQuery.error instanceof Error
                                  ? taskTagsQuery.error
                                  : null
                        }
                        isCreatingTag={createTagMutation.isPending}
                        createTagError={
                            createTagMutation.error instanceof Error
                                ? createTagMutation.error
                                : null
                        }
                        onCreateTag={(payload) =>
                            createTagMutation.mutateAsync(payload)
                        }
                        comments={comments}
                        availableAssignees={availableAssignees}
                        isAssigneesRefreshing={assigneesQuery.isFetching}
                        assigneesError={
                            assigneesQuery.error instanceof Error
                                ? assigneesQuery.error
                                : null
                        }
                        isAssigningTask={assignTaskMutation.isPending}
                        assignTaskError={
                            assignTaskMutation.error instanceof Error
                                ? assignTaskMutation.error
                                : null
                        }
                        onAssignTask={(assigneeId) =>
                            assignTaskMutation.mutate(assigneeId)
                        }
                        isCommentsRefreshing={commentsQuery.isFetching}
                        commentsError={
                            commentsQuery.error instanceof Error
                                ? commentsQuery.error
                                : null
                        }
                        commentDraft={commentDraft}
                        onCommentDraftChange={setCommentDraft}
                        isCommentSubmitDisabled={isCommentSubmitDisabled}
                        isCreatingComment={createCommentMutation.isPending}
                        onSubmitComment={() => createCommentMutation.mutate()}
                        currentUserId={user?.userId}
                    />
                ) : null}
            </SheetContent>
        </Sheet>
    );
};
