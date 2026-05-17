'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createProjectFolder,
    createProject,
    deleteProjectFolder,
    deleteProject,
    getProjectFolders,
    getProjects,
    type ProjectFolderResponse,
    type ProjectResponse,
    type ProjectStatus,
    uploadProjectImage,
    updateProjectFolder,
    updateProject,
} from '@/shared/api';
import Header from '@/shared/ui/header';
import {
    ActiveProjectProvider,
    ProjectTabProvider,
    useCurrentUser,
    type ProjectFolder,
    type ProjectSummary,
    type ProjectTab,
} from '@/shared/lib';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/widgets/app-sidebar';

type ProjectTabShellProps = {
    children: ReactNode;
};

const projectAccentPalette = [
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
] as const;

const defaultBoardTabs = ['BACKLOG', 'IN PROGRESS', 'DONE'];

const emptyProject: ProjectSummary = {
    id: 'empty-project',
    name: 'Workspace',
    shortLabel: 'WS',
    avatar: 'WS',
    avatarClassName: 'bg-slate-100 text-slate-600',
    description: '',
    boardTabs: defaultBoardTabs,
    status: 'ACTIVE',
    memberCount: 0,
};

const normalizeInitials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || 'PR';

const getOwnerName = (project: ProjectResponse) =>
    [project.ownerFirstname, project.ownerLastname]
        .filter(Boolean)
        .join(' ')
        .trim() ||
    project.ownerEmail ||
    'Без владельца';

const getFolderOwnerName = (folder: ProjectFolderResponse) =>
    [folder.ownerFirstname, folder.ownerLastname]
        .filter(Boolean)
        .join(' ')
        .trim() ||
    folder.ownerEmail ||
    'Без владельца';

const mapProjectFolderResponse = (
    folder: ProjectFolderResponse,
): ProjectFolder => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt,
    ownerId: folder.ownerId ?? undefined,
    ownerName: getFolderOwnerName(folder),
    ownerEmail: folder.ownerEmail ?? undefined,
    ownerAvatarUrl: folder.ownerAvatarUrl,
});

const mapProjectResponseToSummary = (
    project: ProjectResponse,
    index: number,
    override?: ProjectSummary,
): ProjectSummary => {
    const paletteIndex = index >= 0 ? index % projectAccentPalette.length : 0;

    return {
        id: project.id,
        name: project.name,
        shortLabel: override?.shortLabel ?? normalizeInitials(project.name),
        avatar: override?.avatar ?? normalizeInitials(project.name),
        avatarClassName:
            override?.avatarClassName ?? projectAccentPalette[paletteIndex],
        imageUrl: project.imageUrl,
        description: override?.description ?? project.description ?? '',
        boardTabs: override?.boardTabs ?? defaultBoardTabs,
        status: override?.status ?? project.status,
        memberCount: override?.memberCount ?? 1,
        createdAt: project.createdAt,
        ownerId: project.ownerId ?? undefined,
        ownerName: getOwnerName(project),
        ownerEmail: project.ownerEmail ?? undefined,
        ownerAvatarUrl: project.ownerAvatarUrl,
        folderId: project.folderId ?? undefined,
    };
};

const ProjectTabShell = ({ children }: ProjectTabShellProps) => {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const { data: user } = useCurrentUser();
    const [projectOverrides, setProjectOverrides] = useState<
        Record<string, ProjectSummary>
    >({});
    const [collapsedFolderIds, setCollapsedFolderIds] = useState<string[]>([]);
    const [activeProjectTab, setActiveProjectTab] =
        useState<ProjectTab>('Задачи');
    const [activeProjectId, setActiveProjectId] = useState('');
    const [activeBoardId, setActiveBoardId] = useState(defaultBoardTabs[0]);

    const projectsQuery = useQuery({
        queryKey: ['projects', user?.organizationId],
        queryFn: getProjects,
        enabled: Boolean(user?.organizationId),
        retry: false,
    });
    const projectFoldersQuery = useQuery({
        queryKey: ['project-folders', user?.organizationId],
        queryFn: getProjectFolders,
        enabled: Boolean(user?.organizationId),
        retry: false,
    });

    const createProjectMutation = useMutation({
        mutationFn: createProject,
    });
    const createProjectFolderMutation = useMutation({
        mutationFn: createProjectFolder,
    });
    const updateProjectFolderMutation = useMutation({
        mutationFn: ({
            folderId,
            name,
            ownerId,
        }: {
            folderId: string;
            name: string;
            ownerId?: string;
        }) => updateProjectFolder(folderId, { name, ownerId }),
    });
    const deleteProjectFolderMutation = useMutation({
        mutationFn: deleteProjectFolder,
    });
    const updateProjectMutation = useMutation({
        mutationFn: ({
            projectId,
            name,
            description,
            status,
            ownerId,
            folderId,
        }: {
            projectId: string;
            name: string;
            description: string;
            status?: ProjectStatus;
            ownerId?: string;
            folderId?: string;
        }) =>
            updateProject(projectId, {
                name,
                description,
                status,
                ownerId,
                folderId,
            }),
    });
    const deleteProjectMutation = useMutation({
        mutationFn: deleteProject,
    });
    const uploadProjectImageMutation = useMutation({
        mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
            uploadProjectImage(projectId, file),
    });

    const projects = useMemo(
        () =>
            (projectsQuery.data ?? []).map((project, index) =>
                mapProjectResponseToSummary(
                    project,
                    index,
                    projectOverrides[project.id],
                ),
            ),
        [projectOverrides, projectsQuery.data],
    );
    const folders = useMemo(
        () => (projectFoldersQuery.data ?? []).map(mapProjectFolderResponse),
        [projectFoldersQuery.data],
    );

    const showHeader = pathname === '/';
    const activeProject =
        projects.find((project) => project.id === activeProjectId) ??
        projects[0] ??
        emptyProject;
    const effectiveActiveBoardId = activeProject.boardTabs.includes(
        activeBoardId,
    )
        ? activeBoardId
        : activeProject.boardTabs[0];

    useEffect(() => {
        if (
            projects.length > 0 &&
            !projects.some((project) => project.id === activeProjectId)
        ) {
            queueMicrotask(() => {
                setActiveProjectId(projects[0].id);
            });
        }
    }, [activeProjectId, projects]);

    useEffect(() => {
        if (projects.length === 0 && activeProjectId) {
            queueMicrotask(() => {
                setActiveProjectId('');
            });
        }
    }, [activeProjectId, projects.length]);

    const setProjects = useCallback(
        (updater: SetStateAction<ProjectSummary[]>) => {
            setProjectOverrides((currentOverrides) => {
                const currentProjects = (projectsQuery.data ?? []).map(
                    (project, index) =>
                        mapProjectResponseToSummary(
                            project,
                            index,
                            currentOverrides[project.id],
                        ),
                );
                const nextProjects =
                    typeof updater === 'function'
                        ? updater(currentProjects)
                        : updater;

                return nextProjects.reduce<Record<string, ProjectSummary>>(
                    (accumulator, project) => {
                        accumulator[project.id] = project;
                        return accumulator;
                    },
                    {},
                );
            });
        },
        [projectsQuery.data],
    );

    const handleCreateProject = useCallback(
        async (projectDraft: ProjectSummary) => {
            const createdProject = await createProjectMutation.mutateAsync({
                name: projectDraft.name,
                description: projectDraft.description,
                status: projectDraft.status,
                ownerId: projectDraft.ownerId,
                folderId: projectDraft.folderId,
            });

            if (projectDraft.imageFile) {
                await uploadProjectImageMutation.mutateAsync({
                    projectId: createdProject.id,
                    file: projectDraft.imageFile,
                });
            }

            setProjectOverrides((currentOverrides) => ({
                ...currentOverrides,
                [createdProject.id]: mapProjectResponseToSummary(
                    createdProject,
                    projects.length,
                    projectDraft,
                ),
            }));
            setActiveProjectId(createdProject.id);
            await queryClient.invalidateQueries({
                queryKey: ['projects', user?.organizationId],
            });
        },
        [
            createProjectMutation,
            projects.length,
            queryClient,
            uploadProjectImageMutation,
            user?.organizationId,
        ],
    );

    const handleUpdateProject = useCallback(
        async (projectDraft: ProjectSummary) => {
            const updatedProject = await updateProjectMutation.mutateAsync({
                projectId: projectDraft.id,
                name: projectDraft.name,
                description: projectDraft.description,
                status: projectDraft.status,
                ownerId: projectDraft.ownerId,
                folderId: projectDraft.folderId,
            });

            setProjectOverrides((currentOverrides) => ({
                ...currentOverrides,
                [updatedProject.id]: mapProjectResponseToSummary(
                    updatedProject,
                    projects.findIndex(
                        (currentProject) =>
                            currentProject.id === updatedProject.id,
                    ),
                    currentOverrides[updatedProject.id] ?? projectDraft,
                ),
            }));
            await queryClient.invalidateQueries({
                queryKey: ['projects', user?.organizationId],
            });
        },
        [projects, queryClient, updateProjectMutation, user?.organizationId],
    );

    const handleDeleteProject = useCallback(
        async (projectId: string) => {
            await deleteProjectMutation.mutateAsync(projectId);
            setProjectOverrides((currentOverrides) => {
                const nextOverrides = { ...currentOverrides };
                delete nextOverrides[projectId];
                return nextOverrides;
            });
            await queryClient.invalidateQueries({
                queryKey: ['projects', user?.organizationId],
            });
        },
        [deleteProjectMutation, queryClient, user?.organizationId],
    );

    const handleUploadProjectImage = useCallback(
        async (projectId: string, file: File) => {
            const updatedProject = await uploadProjectImageMutation.mutateAsync(
                {
                    projectId,
                    file,
                },
            );

            setProjectOverrides((currentOverrides) => ({
                ...currentOverrides,
                [updatedProject.id]: mapProjectResponseToSummary(
                    updatedProject,
                    projects.findIndex(
                        (currentProject) =>
                            currentProject.id === updatedProject.id,
                    ),
                    currentOverrides[updatedProject.id],
                ),
            }));
            await queryClient.invalidateQueries({
                queryKey: ['projects', user?.organizationId],
            });
        },
        [
            projects,
            queryClient,
            uploadProjectImageMutation,
            user?.organizationId,
        ],
    );

    const handleCreateFolder = useCallback(
        async (folder: ProjectFolder) => {
            await createProjectFolderMutation.mutateAsync({
                name: folder.name,
                ownerId: folder.ownerId,
            });
            await queryClient.invalidateQueries({
                queryKey: ['project-folders', user?.organizationId],
            });
        },
        [createProjectFolderMutation, queryClient, user?.organizationId],
    );

    const handleUpdateFolder = useCallback(
        async (folder: ProjectFolder) => {
            await updateProjectFolderMutation.mutateAsync({
                folderId: folder.id,
                name: folder.name,
                ownerId: folder.ownerId,
            });
            await queryClient.invalidateQueries({
                queryKey: ['project-folders', user?.organizationId],
            });
        },
        [queryClient, updateProjectFolderMutation, user?.organizationId],
    );

    const handleDeleteFolder = useCallback(
        async (folderId: string) => {
            await deleteProjectFolderMutation.mutateAsync(folderId);
            setCollapsedFolderIds((currentIds) =>
                currentIds.filter((currentId) => currentId !== folderId),
            );
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['project-folders', user?.organizationId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['projects', user?.organizationId],
                }),
            ]);
        },
        [deleteProjectFolderMutation, queryClient, user?.organizationId],
    );

    return (
        <ActiveProjectProvider
            value={{
                projects,
                setProjects: setProjects as Dispatch<
                    SetStateAction<ProjectSummary[]>
                >,
                createProject: handleCreateProject,
                updateProject: handleUpdateProject,
                uploadProjectImage: handleUploadProjectImage,
                deleteProject: handleDeleteProject,
                createFolder: handleCreateFolder,
                updateFolder: handleUpdateFolder,
                deleteFolder: handleDeleteFolder,
                folders,
                collapsedFolderIds,
                setCollapsedFolderIds,
                activeProjectId,
                setActiveProjectId,
                activeBoardId: effectiveActiveBoardId,
                setActiveBoardId,
            }}
        >
            <ProjectTabProvider
                value={{ activeProjectTab, setActiveProjectTab }}
            >
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="h-svh min-h-0 overflow-hidden">
                        {showHeader ? (
                            <Header
                                project={activeProject}
                                activeProjectTab={activeProjectTab}
                                onProjectTabChange={setActiveProjectTab}
                            />
                        ) : null}
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ProjectTabProvider>
        </ActiveProjectProvider>
    );
};

export default ProjectTabShell;
