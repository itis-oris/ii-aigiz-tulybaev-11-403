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
    statusFilter: 'all' | ProjectListItem['status'];
    placementFilter: 'all' | 'foldered' | 'root';
};

export const useAllProjectsWorkspace = ({
    folders,
    projects,
    query,
    statusFilter,
    placementFilter,
}: UseAllProjectsWorkspaceParams) => {
    const projectItems = useMemo<ProjectListItem[]>(
        () =>
            projects.map((project, index) => ({
                ...project,
                ...(projectOwners[index] ?? fallbackOwner),
            })),
        [projects],
    );
    const filteredProjectItems = useMemo(
        () =>
            projectItems.filter((project) => {
                const matchesStatus =
                    statusFilter === 'all'
                        ? true
                        : project.status === statusFilter;
                const matchesPlacement =
                    placementFilter === 'all'
                        ? true
                        : placementFilter === 'foldered'
                          ? Boolean(project.folderId)
                          : !project.folderId;

                return matchesStatus && matchesPlacement;
            }),
        [placementFilter, projectItems, statusFilter],
    );
    const statusOptions = useMemo(
        () =>
            [...new Set(projectItems.map((project) => project.status))].sort(),
        [projectItems],
    );

    const { groupedFolders, hasResults, normalizedQuery, rootProjects } =
        useProjectFolderTree({
            folders,
            projects: filteredProjectItems,
            query,
            matchesProjectQuery: (project, normalizedValue) =>
                [
                    project.name,
                    project.ownerName,
                    project.status,
                    project.boardTabs.join(' '),
                    project.description,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedValue),
        });

    return {
        groupedFolders,
        hasResults,
        normalizedQuery,
        rootProjects,
        statusOptions,
    };
};
