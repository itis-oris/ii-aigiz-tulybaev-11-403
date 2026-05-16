'use client';

import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/react';

type ParseDragProjectId = (
    value: string | number | symbol | null | undefined,
) => string | null;

type ParseDropFolderId = (
    value: string | number | symbol | null | undefined,
) => string | undefined;

type UseProjectFolderDndControllerParams = {
    moveProjectToFolder: (projectId: string, folderId?: string) => void;
    parseProjectId: ParseDragProjectId;
    parseFolderId: ParseDropFolderId;
};

export const useProjectFolderDndController = ({
    moveProjectToFolder,
    parseProjectId,
    parseFolderId,
}: UseProjectFolderDndControllerParams) => {
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(
        null,
    );

    const handleDragStart = ({ operation }: DragStartEvent) => {
        setDraggedProjectId(parseProjectId(operation.source?.id) ?? null);
    };

    const handleDragEnd = ({ operation }: DragEndEvent) => {
        setDraggedProjectId(null);

        const projectId = parseProjectId(operation.source?.id);
        const nextFolderId = parseFolderId(operation.target?.id);

        if (!projectId || operation.target?.id == null) {
            return;
        }

        moveProjectToFolder(projectId, nextFolderId);
    };

    return {
        draggedProjectId,
        handleDragEnd,
        handleDragStart,
    };
};
