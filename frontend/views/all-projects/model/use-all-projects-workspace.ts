'use client';

import { useMemo } from 'react';
import {
    useProjectFolderTree,
    type ProjectFolder,
    type ProjectSummary,
    type GroupedFolderProjects,
} from '@/shared/lib';
import type { ProjectListItem } from '@/views/all-projects/ui/project-list-item';

const projectOwners = [
    {
        ownerName: 'Расиль',
        ownerInitials: 'Р',
        ownerClassName: 'bg-slate-100 text-slate-600',
        status: 'В работе' as const,
        dateLabel: '-',
    },
    {
        ownerName: 'София',
        ownerInitials: 'С',
        ownerClassName: 'bg-sky-100 text-sky-700',
        status: 'В работе' as const,
        dateLabel: '12 мая',
    },
    {
        ownerName: 'Анна',
        ownerInitials: 'А',
        ownerClassName: 'bg-emerald-100 text-emerald-700',
        status: 'Планирование' as const,
        dateLabel: '18 мая',
    },
    {
        ownerName: 'Илья',
        ownerInitials: 'И',
        ownerClassName: 'bg-violet-100 text-violet-700',
        status: 'В работе' as const,
        dateLabel: '24 мая',
    },
];

const fallbackOwner = {
    ownerName: 'Артем',
    ownerInitials: 'А',
    ownerClassName: 'bg-zinc-100 text-zinc-700',
    status: 'Планирование' as const,
    dateLabel: 'Сегодня',
};

export type GroupedProjectFolder = GroupedFolderProjects<ProjectListItem>;

type UseAllProjectsWorkspaceParams = {
    folders: ProjectFolder[];
    projects: ProjectSummary[];
    query: string;
};

export const useAllProjectsWorkspace = ({
    folders,
    projects,
    query,
}: UseAllProjectsWorkspaceParams) => {
    const projectItems = useMemo<ProjectListItem[]>(
        () =>
            projects.map((project, index) => ({
                ...project,
                ...(projectOwners[index] ?? fallbackOwner),
            })),
        [projects],
    );

    const { groupedFolders, hasResults, normalizedQuery, rootProjects } =
        useProjectFolderTree({
            folders,
            projects: projectItems,
            query,
        });

    return {
        groupedFolders,
        hasResults,
        normalizedQuery,
        rootProjects,
    };
};
