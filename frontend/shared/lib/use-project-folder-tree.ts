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
};

export const useProjectFolderTree = <TProject extends FolderProjectItem>({
    folders,
    projects,
    query = '',
}: UseProjectFolderTreeParams<TProject>) => {
    const normalizedQuery = query.trim().toLowerCase();

    const groupedFolders = useMemo(
        () =>
            folders
                .map((folder) => {
                    const folderProjects = projects.filter(
                        (project) => project.folderId === folder.id,
                    );
                    const folderMatches = folder.name
                        .toLowerCase()
                        .includes(normalizedQuery);
                    const matchingProjects = folderProjects.filter((project) =>
                        project.name.toLowerCase().includes(normalizedQuery),
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
        [folders, normalizedQuery, projects],
    );

    const rootProjects = useMemo(
        () =>
            projects.filter((project) => {
                if (project.folderId) {
                    return false;
                }

                return normalizedQuery
                    ? project.name.toLowerCase().includes(normalizedQuery)
                    : true;
            }),
        [normalizedQuery, projects],
    );

    return {
        groupedFolders,
        hasResults: groupedFolders.length > 0 || rootProjects.length > 0,
        normalizedQuery,
        rootProjects,
    };
};
