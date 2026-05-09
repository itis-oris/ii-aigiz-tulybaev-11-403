import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { ActiveProjectProvider, organizationProjects } from '@/shared/lib';
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
        const [activeProjectId, setActiveProjectId] = useState(
            organizationProjects[0].id,
        );

        return (
            <ActiveProjectProvider
                value={{ activeProjectId, setActiveProjectId }}
            >
                <AllProjectsPage />
            </ActiveProjectProvider>
        );
    },
};
