'use client';

import { useMemo } from 'react';
import {
    useProjectFolderTree,
    type ProjectFolder,
    type ProjectSummary,
    type GroupedFolderProjects,
} from '@/shared/lib';
import type { ProjectListItem } from '@/views/all-projects/ui/project-list-item';

const projectDateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
});

const ownerAccentPalette = [
    'bg-slate-100 text-slate-600',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

const getOwnerName = (project: ProjectSummary) =>
    project.ownerName || project.ownerEmail || 'Без владельца';

const getOwnerInitials = (ownerName: string) =>
    ownerName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || 'PR';

const getOwnerClassName = (seed: string) => {
    const hash = [...seed].reduce(
        (accumulator, char) => accumulator + char.charCodeAt(0),
        0,
    );

    return ownerAccentPalette[hash % ownerAccentPalette.length];
};

const getStatusLabel = (
    status: ProjectSummary['status'],
): ProjectListItem['statusLabel'] => {
    switch (status) {
        case 'ACTIVE':
            return 'В работе';
        case 'ON_HOLD':
            return 'На паузе';
        case 'COMPLETED':
            return 'Завершен';
        case 'PLANNING':
        default:
            return 'Планирование';
    }
};

const getDateLabel = (createdAt?: string) => {
    if (!createdAt) {
        return '-';
    }

    const parsedDate = new Date(createdAt);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return projectDateFormatter.format(parsedDate);
};

export type GroupedProjectFolder = GroupedFolderProjects<ProjectListItem>;

type UseAllProjectsWorkspaceParams = {
    folders: ProjectFolder[];
    projects: ProjectSummary[];
    query: string;
    statusFilter: 'all' | ProjectListItem['statusLabel'];
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
            projects.map((project) => {
                const ownerName = getOwnerName(project);
                const ownerSeed =
                    project.ownerId ?? project.ownerEmail ?? ownerName;

                return {
                    ...project,
                    ownerName,
                    ownerInitials: getOwnerInitials(ownerName),
                    ownerClassName: getOwnerClassName(ownerSeed),
                    statusLabel: getStatusLabel(project.status),
                    dateLabel: getDateLabel(project.createdAt),
                };
            }),
        [projects],
    );
    const filteredProjectItems = useMemo(
        () =>
            projectItems.filter((project) => {
                const matchesStatus =
                    statusFilter === 'all'
                        ? true
                        : project.statusLabel === statusFilter;
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
            [
                ...new Set(projectItems.map((project) => project.statusLabel)),
            ].sort(),
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
                    project.statusLabel,
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
