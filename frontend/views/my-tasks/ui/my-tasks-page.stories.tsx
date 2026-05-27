import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MyTasksPage from './my-tasks-page';

const meta = {
    title: 'Views/MyTasks/Page',
    component: MyTasksPage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof MyTasksPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
