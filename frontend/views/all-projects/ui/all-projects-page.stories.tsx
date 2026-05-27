import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import {
    ActiveProjectProvider,
    organizationProjects,
    type ProjectFolder,
} from '@/shared/lib';
import AllProjectsPage from './all-projects-page';

const meta = {
    title: 'Views/AllProjects/Page',
    component: AllProjectsPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof AllProjectsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => {
        const [projects, setProjects] = useState(organizationProjects);
        const [folders] = useState<ProjectFolder[]>([]);
        const [collapsedFolderIds, setCollapsedFolderIds] = useState<string[]>(
            [],
        );
        const [activeProjectId, setActiveProjectId] = useState(
            organizationProjects[0].id,
        );
        const [activeBoardId, setActiveBoardId] = useState(
            organizationProjects[0].boardTabs[0],
        );

        return (
            <ActiveProjectProvider
                value={{
                    projects,
                    setProjects,
                    createProject: async (project) => {
                        setProjects((currentProjects) => [
                            ...currentProjects,
                            project,
                        ]);
                    },
                    updateProject: async (project) => {
                        setProjects((currentProjects) =>
                            currentProjects.map((currentProject) =>
                                currentProject.id === project.id
                                    ? project
                                    : currentProject,
                            ),
                        );
                    },
                    uploadProjectImage: async () => {},
                    deleteProject: async (projectId) => {
                        setProjects((currentProjects) =>
                            currentProjects.filter(
                                (currentProject) =>
                                    currentProject.id !== projectId,
                            ),
                        );
                    },
                    createFolder: async () => {},
                    updateFolder: async () => {},
                    deleteFolder: async () => {},
                    folders,
                    collapsedFolderIds,
                    setCollapsedFolderIds,
                    activeProjectId,
                    setActiveProjectId,
                    activeBoardId,
                    setActiveBoardId,
                }}
            >
                <AllProjectsPage />
            </ActiveProjectProvider>
        );
    },
};
