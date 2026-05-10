import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { organizationProjects } from '@/shared/lib';
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

export const Overview: Story = {
    args: {
        project: organizationProjects[0],
        activeProjectTab: 'Обзор',
    },
};

export const Tasks: Story = {
    args: {
        project: organizationProjects[0],
        activeProjectTab: 'Задачи',
    },
};
