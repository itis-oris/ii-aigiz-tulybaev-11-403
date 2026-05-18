import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Avatar, Badge, Button } from '@/shared/ui';
import { Input } from '@/shared/ui/input';
import { SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet';
import type { TaskSheetBodyProps } from './task-sheet.types';
import {
    getDueInDaysLabel,
    getInitials,
    getPriorityLabel,
    getStoryPointsLabel,
    renderAvatarContent,
    toDateTimeLocalValue,
    toIsoDateTime,
} from './task-sheet.lib';
import { TaskSheetErrorNotice } from './task-sheet-error-notice';
import { TaskSheetMetaRow } from './task-sheet-meta-row';
import { TaskSheetStatusActions } from './task-sheet-status-actions';
import { TaskSheetAssigneeField } from './task-sheet-assignee-field';
import { TaskSheetTagsSection } from './task-sheet-tags-section';
import { TaskSheetCommentsSection } from './task-sheet-comments-section';

export const TaskSheetBody = ({
    resolvedTask,
    selectedTaskId,
    taskQueryError,
    isTaskRefreshing,
    resolvedApiStatus,
    isUpdatingStatus,
    statusUpdateTarget,
    statusUpdateError,
    onUpdateStatus,
    onSaveTask,
    onSaveTags,
    isSavingTask,
    isSavingTags,
    isDeletingTask,
    saveTaskError,
    saveTagsError,
    deleteTaskError,
    availableTags,
    isTagsRefreshing,
    tagsError,
    isCreatingTag,
    createTagError,
    onCreateTag,
    comments,
    availableAssignees,
    isAssigneesRefreshing,
    assigneesError,
    isAssigningTask,
    assignTaskError,
    onAssignTask,
    isCommentsRefreshing,
    commentsError,
    commentDraft,
    onCommentDraftChange,
    isCommentSubmitDisabled,
    isCreatingComment,
    onSubmitComment,
    onDeleteTask,
    currentUserId,
}: TaskSheetBodyProps) => {
    const descriptionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [titleDraft, setTitleDraft] = useState(resolvedTask.title);
    const [descriptionDraft, setDescriptionDraft] = useState(
        resolvedTask.description ?? '',
    );
    const [dueDateDraft, setDueDateDraft] = useState(
        toDateTimeLocalValue(resolvedTask.dueDate),
    );
    const [storyPointsDraft, setStoryPointsDraft] = useState(
        resolvedTask.storyPoints !== undefined
            ? String(resolvedTask.storyPoints)
            : '',
    );
    const [priorityDraft, setPriorityDraft] = useState(
        resolvedTask.priority !== undefined
            ? String(resolvedTask.priority)
            : '',
    );
    const [isPrivateDraft, setIsPrivateDraft] = useState(
        Boolean(resolvedTask.isPrivate),
    );
    const [selectedTagIds, setSelectedTagIds] = useState(
        resolvedTask.tags.filter((tag) => !tag.system).map((tag) => tag.id),
    );

    const normalizedTitle = titleDraft.trim();
    const normalizedDescription = descriptionDraft.trim();
    const normalizedStoryPoints = storyPointsDraft.trim();
    const normalizedPriority = priorityDraft.trim();
    const initialDueDate = toDateTimeLocalValue(resolvedTask.dueDate);
    const initialTagIds = [
        ...resolvedTask.tags.filter((tag) => !tag.system).map((tag) => tag.id),
    ].sort();
    const normalizedSelectedTagIds = [...selectedTagIds].sort();
    const hasChanges =
        normalizedTitle !== resolvedTask.title ||
        normalizedDescription !== (resolvedTask.description ?? '') ||
        dueDateDraft !== initialDueDate ||
        normalizedStoryPoints !==
            (resolvedTask.storyPoints !== undefined
                ? String(resolvedTask.storyPoints)
                : '') ||
        normalizedPriority !==
            (resolvedTask.priority !== undefined
                ? String(resolvedTask.priority)
                : '') ||
        isPrivateDraft !== Boolean(resolvedTask.isPrivate) ||
        initialTagIds.join(',') !== normalizedSelectedTagIds.join(',');

    const handleReset = () => {
        setTitleDraft(resolvedTask.title);
        setDescriptionDraft(resolvedTask.description ?? '');
        setDueDateDraft(initialDueDate);
        setStoryPointsDraft(
            resolvedTask.storyPoints !== undefined
                ? String(resolvedTask.storyPoints)
                : '',
        );
        setPriorityDraft(
            resolvedTask.priority !== undefined
                ? String(resolvedTask.priority)
                : '',
        );
        setIsPrivateDraft(Boolean(resolvedTask.isPrivate));
        setSelectedTagIds(initialTagIds);
    };

    const handleToggleTag = (tagId: string) => {
        const nextTagIds = selectedTagIds.includes(tagId)
            ? selectedTagIds.filter((id) => id !== tagId)
            : [...selectedTagIds, tagId];

        setSelectedTagIds(nextTagIds);
        onSaveTags([...nextTagIds].sort());
    };

    const handleSelectTagIds = (tagIds: string[]) => {
        setSelectedTagIds(tagIds);
        onSaveTags([...tagIds].sort());
    };

    const currentCreator =
        availableAssignees.find(
            (assignee) => assignee.id === resolvedTask.creatorId,
        ) ?? null;
    const draftDueDateLabel = getDueInDaysLabel(toIsoDateTime(dueDateDraft));

    useEffect(() => {
        const textarea = descriptionTextareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = '0px';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [descriptionDraft]);

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border bg-muted/40">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="sidebar" size="sm">
                                #{resolvedTask.id}
                            </Badge>
                            <Badge size="sm">{resolvedTask.status}</Badge>
                            <Badge variant="accent" size="sm">
                                {draftDueDateLabel}
                            </Badge>
                            {isPrivateDraft ? (
                                <Badge variant="outline" size="sm">
                                    Приватная
                                </Badge>
                            ) : null}
                            {isTaskRefreshing ? (
                                <Badge variant="outline" size="sm">
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                    Обновление
                                </Badge>
                            ) : null}
                        </div>
                        <div className="space-y-3">
                            <SheetTitle className="sr-only">
                                Задача #{selectedTaskId}
                            </SheetTitle>
                            <Input
                                value={titleDraft}
                                onChange={(event) =>
                                    setTitleDraft(event.target.value)
                                }
                                uiSize="lg"
                                placeholder="Название задачи"
                                className="h-auto border-0 bg-transparent px-0 text-xl font-semibold leading-tight shadow-none focus-visible:ring-0"
                            />
                            <SheetDescription className="w-full max-w-none">
                                <textarea
                                    ref={descriptionTextareaRef}
                                    value={descriptionDraft}
                                    onChange={(event) =>
                                        setDescriptionDraft(event.target.value)
                                    }
                                    rows={1}
                                    placeholder="Описание задачи пока не заполнено."
                                    className="min-h-0 w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-sm leading-6 text-muted-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0"
                                />
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeletingTask}
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Удалить эту задачу? Действие нельзя отменить.',
                                    )
                                ) {
                                    onDeleteTask();
                                }
                            }}
                        >
                            {isDeletingTask ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : null}
                            Удалить
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                !hasChanges || isSavingTask || isDeletingTask
                            }
                            onClick={handleReset}
                        >
                            Сбросить
                        </Button>
                        <Button
                            type="button"
                            disabled={
                                !normalizedTitle ||
                                !hasChanges ||
                                isSavingTask ||
                                isDeletingTask
                            }
                            onClick={() =>
                                onSaveTask({
                                    title: normalizedTitle,
                                    description:
                                        normalizedDescription || undefined,
                                    dueDate: toIsoDateTime(dueDateDraft),
                                    storyPoints: normalizedStoryPoints
                                        ? Number(normalizedStoryPoints)
                                        : undefined,
                                    priority: normalizedPriority
                                        ? Number(normalizedPriority)
                                        : undefined,
                                    isPrivate: isPrivateDraft,
                                    tagIds: normalizedSelectedTagIds,
                                })
                            }
                        >
                            {isSavingTask ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : null}
                            Сохранить
                        </Button>
                    </div>
                </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-8 p-8">
                {taskQueryError ? (
                    <TaskSheetErrorNotice>
                        Не удалось загрузить полные данные задачи:{' '}
                        {taskQueryError.message}
                    </TaskSheetErrorNotice>
                ) : null}

                {saveTaskError ? (
                    <TaskSheetErrorNotice>
                        Не удалось сохранить изменения: {saveTaskError.message}
                    </TaskSheetErrorNotice>
                ) : null}

                {saveTagsError ? (
                    <TaskSheetErrorNotice>
                        Не удалось сохранить теги: {saveTagsError.message}
                    </TaskSheetErrorNotice>
                ) : null}

                {deleteTaskError ? (
                    <TaskSheetErrorNotice>
                        Не удалось удалить задачу: {deleteTaskError.message}
                    </TaskSheetErrorNotice>
                ) : null}

                <TaskSheetStatusActions
                    resolvedApiStatus={resolvedApiStatus}
                    isUpdatingStatus={isUpdatingStatus}
                    statusUpdateTarget={statusUpdateTarget}
                    onUpdateStatus={onUpdateStatus}
                />

                {statusUpdateError ? (
                    <TaskSheetErrorNotice>
                        Не удалось обновить статус: {statusUpdateError.message}
                    </TaskSheetErrorNotice>
                ) : null}
                {assignTaskError ? (
                    <TaskSheetErrorNotice>
                        Не удалось назначить исполнителя:{' '}
                        {assignTaskError.message}
                    </TaskSheetErrorNotice>
                ) : null}
                {assigneesError ? (
                    <TaskSheetErrorNotice>
                        Не удалось загрузить список исполнителей:{' '}
                        {assigneesError.message}
                    </TaskSheetErrorNotice>
                ) : null}

                <div className="space-y-5">
                    <TaskSheetAssigneeField
                        resolvedTask={resolvedTask}
                        availableAssignees={availableAssignees}
                        isAssigneesRefreshing={isAssigneesRefreshing}
                        isAssigningTask={isAssigningTask}
                        onAssignTask={onAssignTask}
                    />

                    <TaskSheetMetaRow label="Проект">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                            <Badge variant="sidebar" size="sm">
                                {resolvedTask.project}
                            </Badge>
                            {resolvedTask.boardName ? (
                                <>
                                    <span className="text-muted-foreground">
                                        ›
                                    </span>
                                    <span>{resolvedTask.boardName}</span>
                                </>
                            ) : null}
                        </div>
                    </TaskSheetMetaRow>

                    <TaskSheetMetaRow label="Колонка">
                        <div className="text-sm text-foreground">
                            {resolvedTask.columnName ?? resolvedTask.status}
                        </div>
                    </TaskSheetMetaRow>

                    <TaskSheetMetaRow label="Дата">
                        <div className="flex flex-1 items-center gap-3">
                            <Input
                                type="datetime-local"
                                uiSize="md"
                                value={dueDateDraft}
                                onChange={(event) =>
                                    setDueDateDraft(event.target.value)
                                }
                                className="max-w-xs"
                            />
                            <Badge variant="accent" size="sm">
                                {draftDueDateLabel}
                            </Badge>
                        </div>
                    </TaskSheetMetaRow>

                    <TaskSheetMetaRow label="Оценка времени">
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                uiSize="md"
                                value={storyPointsDraft}
                                onChange={(event) =>
                                    setStoryPointsDraft(event.target.value)
                                }
                                placeholder="Например, 5"
                                className="w-32"
                            />
                            <Badge shape="pill">
                                {getStoryPointsLabel(
                                    normalizedStoryPoints
                                        ? Number(normalizedStoryPoints)
                                        : undefined,
                                )}
                            </Badge>
                        </div>
                    </TaskSheetMetaRow>

                    <TaskSheetMetaRow label="Приоритет">
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                uiSize="md"
                                value={priorityDraft}
                                onChange={(event) =>
                                    setPriorityDraft(event.target.value)
                                }
                                placeholder="0-10"
                                className="w-28"
                            />
                            <span className="text-sm text-foreground">
                                {getPriorityLabel(
                                    normalizedPriority
                                        ? Number(normalizedPriority)
                                        : undefined,
                                )}
                            </span>
                        </div>
                    </TaskSheetMetaRow>

                    <TaskSheetMetaRow label="Приватность">
                        <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-input/20 px-3 text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={isPrivateDraft}
                                onChange={(event) =>
                                    setIsPrivateDraft(event.target.checked)
                                }
                                className="size-4 rounded border-border"
                            />
                            <span>Приватная задача</span>
                        </label>
                    </TaskSheetMetaRow>

                    <TaskSheetMetaRow label="Создатель">
                        <div className="flex flex-1 items-center gap-3">
                            <Avatar
                                size="xl"
                                className="bg-sidebar text-sidebar-foreground"
                            >
                                {renderAvatarContent({
                                    avatarUrl: currentCreator?.avatarUrl,
                                    fallback: getInitials(
                                        currentCreator?.label ??
                                            resolvedTask.creatorEmail,
                                    ),
                                })}
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground">
                                    {currentCreator?.label ??
                                        resolvedTask.creatorEmail ??
                                        'Неизвестно'}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {currentCreator?.email ??
                                        resolvedTask.creatorEmail ??
                                        'Почта не указана'}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Автор задачи
                                </div>
                            </div>
                        </div>
                    </TaskSheetMetaRow>
                </div>

                {tagsError ? (
                    <TaskSheetErrorNotice>
                        Не удалось загрузить теги проекта: {tagsError.message}
                    </TaskSheetErrorNotice>
                ) : null}
                {createTagError ? (
                    <TaskSheetErrorNotice>
                        Не удалось создать тег: {createTagError.message}
                    </TaskSheetErrorNotice>
                ) : null}

                <TaskSheetTagsSection
                    resolvedTask={resolvedTask}
                    selectedTagIds={selectedTagIds}
                    availableTags={availableTags}
                    isTagsRefreshing={isTagsRefreshing}
                    isSavingTags={isSavingTags}
                    isCreatingTag={isCreatingTag}
                    onToggleTag={handleToggleTag}
                    onSelectTagIds={handleSelectTagIds}
                    onCreateTag={onCreateTag}
                />

                <TaskSheetCommentsSection
                    comments={comments}
                    isCommentsRefreshing={isCommentsRefreshing}
                    commentsError={commentsError}
                    commentDraft={commentDraft}
                    onCommentDraftChange={onCommentDraftChange}
                    isCommentSubmitDisabled={isCommentSubmitDisabled}
                    isCreatingComment={isCreatingComment}
                    onSubmitComment={onSubmitComment}
                    currentUserId={currentUserId}
                />
            </div>
        </div>
    );
};
