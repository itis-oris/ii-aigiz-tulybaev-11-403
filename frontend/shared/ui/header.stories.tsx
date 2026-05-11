import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
    ActiveProjectProvider,
    organizationProjects,
    type ProjectFolder,
} from '@/shared/lib';
import Header from './header';

const meta = {
    title: 'Shared/Header',
    component: Header,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

const HeaderWithProvider = (args: React.ComponentProps<typeof Header>) => {
    const [projects, setProjects] = useState(organizationProjects);
    const [folders, setFolders] = useState<ProjectFolder[]>([]);
    const [collapsedFolderIds, setCollapsedFolderIds] = useState<string[]>([]);
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
            <Header {...args} />
        </ActiveProjectProvider>
    );
};

export const Overview: Story = {
    render: (args) => <HeaderWithProvider {...args} />,
    args: {
        project: organizationProjects[0],
        activeProjectTab: 'Обзор',
    },
};

export const Tasks: Story = {
    render: (args) => <HeaderWithProvider {...args} />,
    args: {
        project: organizationProjects[0],
        activeProjectTab: 'Задачи',
    },
};
