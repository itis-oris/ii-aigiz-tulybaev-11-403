import type { TaskResponse } from '@/shared/api';
import type { Task } from './types';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const statusMap = {
    TODO: 'todo',
    IN_PROGRESS: 'in progress',
    DONE: 'done',
} as const;

const getDueInDays = (dueDate: string | null) => {
    if (!dueDate) {
        return 0;
    }

    const dueDateValue = new Date(dueDate);

    if (Number.isNaN(dueDateValue.getTime())) {
        return 0;
    }

    return Math.max(
        0,
        Math.ceil((dueDateValue.getTime() - Date.now()) / MS_IN_DAY),
    );
};

export const mapTaskResponseToTask = (task: TaskResponse): Task => {
    const mappedTags = task.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        system: tag.system,
        projectId: tag.projectId ?? undefined,
        projectName: tag.projectName ?? undefined,
    }));
    const hasBoardTag = mappedTags.some(
        (tag) => tag.system && task.boardId && tag.id === task.boardId,
    );
    const tags =
        !hasBoardTag && task.boardId && task.boardName
            ? [
                  {
                      id: task.boardId,
                      name: task.boardName,
                      color: '#334155',
                      system: true,
                      projectId: task.projectId ?? undefined,
                      projectName: task.projectName ?? undefined,
                  },
                  ...mappedTags,
              ]
            : mappedTags;

    return {
        id: task.id,
        title: task.title,
        description: task.description ?? undefined,
        storyPoints: task.storyPoints ?? undefined,
        priority: task.priority ?? undefined,
        dueDate: task.dueDate ?? undefined,
        columnId: task.columnId ?? task.status,
        position:
            task.position !== null && task.position !== undefined
                ? String(task.position)
                : undefined,
        projectId: task.projectId ?? undefined,
        projectSlug: task.projectId ?? undefined,
        boardId: task.boardId ?? undefined,
        assigneeId: task.assigneeId ?? undefined,
        project: task.projectName ?? 'Без проекта',
        dueInDays: getDueInDays(task.dueDate),
        status: statusMap[task.status],
        tags,
        boardName: task.boardName ?? undefined,
        columnName: task.columnName ?? undefined,
        assigneeEmail: task.assigneeEmail ?? undefined,
        creatorId: task.creatorId ?? undefined,
        creatorEmail: task.creatorEmail ?? undefined,
    };
};
