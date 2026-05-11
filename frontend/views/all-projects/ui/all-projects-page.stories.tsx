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
        const [folders, setFolders] = useState<ProjectFolder[]>([]);
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
                    folders,
                    setFolders,
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
