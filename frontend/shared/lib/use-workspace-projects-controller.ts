'use client';

import { useCallback } from 'react';
import {
    useActiveProject,
    type ProjectFolder,
    type ProjectSummary,
} from './active-project';

const createWorkspaceFolder = (folderName: string): ProjectFolder => ({
    id: `folder-${Date.now()}`,
    name: folderName,
    shortLabel: 'FD',
    avatarClassName: 'bg-slate-100 text-slate-600',
    description: 'Папка проектов рабочего пространства.',
    ownerName: 'Система',
    ownerInitials: 'S',
    ownerClassName: 'bg-slate-100 text-slate-600',
    dateLabel: 'Сегодня',
});

export const useWorkspaceProjectsController = () => {
    const {
        activeProjectId,
        createProject: createProjectInWorkspace,
        deleteProject: deleteProjectInWorkspace,
        setActiveProjectId,
        projects,
        setProjects,
        updateProject: updateProjectInWorkspace,
        folders,
        setFolders,
        collapsedFolderIds,
        setCollapsedFolderIds,
    } = useActiveProject();

    const selectProject = useCallback(
        (projectId: string) => {
            setActiveProjectId(projectId);
        },
        [setActiveProjectId],
    );

    const toggleFolder = useCallback(
        (folderId: string) => {
            setCollapsedFolderIds((currentIds) =>
                currentIds.includes(folderId)
                    ? currentIds.filter((id) => id !== folderId)
                    : [...currentIds, folderId],
            );
        },
        [setCollapsedFolderIds],
    );

    const moveProjectToFolder = useCallback(
        (projectId: string, folderId?: string) => {
            setProjects((currentProjects) =>
                currentProjects.map((project) =>
                    project.id === projectId
                        ? { ...project, folderId }
                        : project,
                ),
            );
        },
        [setProjects],
    );

    const createProject = useCallback(
        async (project: ProjectSummary) => {
            await createProjectInWorkspace(project);
        },
        [createProjectInWorkspace],
    );

    const createFolder = useCallback(
        (folderName: string) => {
            setFolders((currentFolders) => [
                createWorkspaceFolder(folderName),
                ...currentFolders,
            ]);
        },
        [setFolders],
    );

    const updateProject = useCallback(
        async (project: ProjectSummary) => {
            await updateProjectInWorkspace(project);
        },
        [updateProjectInWorkspace],
    );

    const deleteProject = useCallback(
        async (projectId: string) => {
            await deleteProjectInWorkspace(projectId);
        },
        [deleteProjectInWorkspace],
    );

    return {
        activeProjectId,
        collapsedFolderIds,
        folders,
        projects,
        createFolder,
        createProject,
        deleteProject,
        moveProjectToFolder,
        selectProject,
        toggleFolder,
        updateProject,
    };
};
