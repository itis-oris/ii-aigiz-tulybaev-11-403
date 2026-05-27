import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { myTasksGroups } from '@/views/my-tasks/model/mock';
import MyTasksTaskRow from './my-tasks-task-row';

const task = myTasksGroups[0].rows[0];
const completedTask = myTasksGroups[3].rows[1];

const meta = {
    title: 'Views/MyTasks/TaskRow',
    component: MyTasksTaskRow,
    tags: ['autodocs'],
    args: {
        task,
    },
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof MyTasksTaskRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Completed: Story = {
    args: {
        task: completedTask,
    },
};
