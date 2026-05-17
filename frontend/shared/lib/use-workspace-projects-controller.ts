'use client';

import { useCallback } from 'react';
import {
    useActiveProject,
    type ProjectFolder,
    type ProjectSummary,
} from './active-project';

export const useWorkspaceProjectsController = () => {
    const {
        activeProjectId,
        createFolder: createFolderInWorkspace,
        createProject: createProjectInWorkspace,
        deleteFolder: deleteFolderInWorkspace,
        deleteProject: deleteProjectInWorkspace,
        setActiveProjectId,
        projects,
        uploadProjectImage: uploadProjectImageInWorkspace,
        updateProject: updateProjectInWorkspace,
        updateFolder: updateFolderInWorkspace,
        folders,
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
        async (projectId: string, folderId?: string) => {
            const project = projects.find(
                (currentProject) => currentProject.id === projectId,
            );

            if (!project) {
                return;
            }

            await updateProjectInWorkspace({ ...project, folderId });
        },
        [projects, updateProjectInWorkspace],
    );

    const createProject = useCallback(
        async (project: ProjectSummary) => {
            await createProjectInWorkspace(project);
        },
        [createProjectInWorkspace],
    );

    const createFolder = useCallback(
        async (folder: ProjectFolder) => {
            await createFolderInWorkspace(folder);
        },
        [createFolderInWorkspace],
    );

    const updateProject = useCallback(
        async (project: ProjectSummary) => {
            await updateProjectInWorkspace(project);
        },
        [updateProjectInWorkspace],
    );

    const uploadProjectImage = useCallback(
        async (projectId: string, file: File) => {
            await uploadProjectImageInWorkspace(projectId, file);
        },
        [uploadProjectImageInWorkspace],
    );

    const updateFolder = useCallback(
        async (folder: (typeof folders)[number]) => {
            await updateFolderInWorkspace(folder);
        },
        [updateFolderInWorkspace],
    );

    const deleteProject = useCallback(
        async (projectId: string) => {
            await deleteProjectInWorkspace(projectId);
        },
        [deleteProjectInWorkspace],
    );

    const deleteFolder = useCallback(
        async (folderId: string) => {
            await deleteFolderInWorkspace(folderId);
        },
        [deleteFolderInWorkspace],
    );

    return {
        activeProjectId,
        collapsedFolderIds,
        folders,
        projects,
        createFolder,
        createProject,
        deleteFolder,
        deleteProject,
        moveProjectToFolder,
        selectProject,
        toggleFolder,
        uploadProjectImage,
        updateFolder,
        updateProject,
    };
};
