'use client';

import { useMemo } from 'react';
import type { ProjectFolder } from './active-project';

type FolderProjectItem = {
    folderId?: string;
    name: string;
};

export type GroupedFolderProjects<TProject extends FolderProjectItem> = {
    folder: ProjectFolder;
    projects: TProject[];
};

type UseProjectFolderTreeParams<TProject extends FolderProjectItem> = {
    folders: ProjectFolder[];
    projects: TProject[];
    query?: string;
    matchesProjectQuery?: (
        project: TProject,
        normalizedQuery: string,
    ) => boolean;
    matchesFolderQuery?: (
        folder: ProjectFolder,
        normalizedQuery: string,
    ) => boolean;
};

const defaultProjectMatchesQuery = (
    project: FolderProjectItem,
    normalizedQuery: string,
) => project.name.toLowerCase().includes(normalizedQuery);

const defaultFolderMatchesQuery = (
    folder: ProjectFolder,
    normalizedQuery: string,
) => folder.name.toLowerCase().includes(normalizedQuery);

export const useProjectFolderTree = <TProject extends FolderProjectItem>({
    folders,
    projects,
    query = '',
    matchesProjectQuery,
    matchesFolderQuery,
}: UseProjectFolderTreeParams<TProject>) => {
    const normalizedQuery = query.trim().toLowerCase();
    const projectMatchesQuery =
        matchesProjectQuery ?? defaultProjectMatchesQuery;
    const folderMatchesQuery = matchesFolderQuery ?? defaultFolderMatchesQuery;

    const groupedFolders = useMemo(
        () =>
            folders
                .map((folder) => {
                    const folderProjects = projects.filter(
                        (project) => project.folderId === folder.id,
                    );
                    const folderMatches = folderMatchesQuery(
                        folder,
                        normalizedQuery,
                    );
                    const matchingProjects = folderProjects.filter((project) =>
                        projectMatchesQuery(project, normalizedQuery),
                    );

                    if (!normalizedQuery) {
                        return { folder, projects: folderProjects };
                    }

                    if (!folderMatches && matchingProjects.length === 0) {
                        return null;
                    }

                    return {
                        folder,
                        projects: folderMatches
                            ? folderProjects
                            : matchingProjects,
                    };
                })
                .filter(Boolean) as GroupedFolderProjects<TProject>[],
        [
            folderMatchesQuery,
            folders,
            normalizedQuery,
            projectMatchesQuery,
            projects,
        ],
    );

    const rootProjects = useMemo(
        () =>
            projects.filter((project) => {
                if (project.folderId) {
                    return false;
                }

                return normalizedQuery
                    ? projectMatchesQuery(project, normalizedQuery)
                    : true;
            }),
        [normalizedQuery, projectMatchesQuery, projects],
    );

    return {
        groupedFolders,
        hasResults: groupedFolders.length > 0 || rootProjects.length > 0,
        normalizedQuery,
        rootProjects,
    };
};
