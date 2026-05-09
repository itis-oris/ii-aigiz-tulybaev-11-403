import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
        activeProjectTab: 'Обзор',
    },
};

export const Tasks: Story = {
    args: {
        activeProjectTab: 'Задачи',
    },
};
