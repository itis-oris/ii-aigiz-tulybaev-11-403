import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar } from './avatar';

const meta = {
    title: 'Shared/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    args: {
        children: 'MB',
        size: 'md',
        shape: 'full',
        className: 'bg-primary text-primary-foreground',
    },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Avatar size="xs" className="bg-primary text-primary-foreground">
                XS
            </Avatar>
            <Avatar size="sm" className="bg-primary text-primary-foreground">
                SM
            </Avatar>
            <Avatar size="md" className="bg-primary text-primary-foreground">
                MD
            </Avatar>
            <Avatar size="lg" className="bg-primary text-primary-foreground">
                LG
            </Avatar>
            <Avatar size="xl" className="bg-primary text-primary-foreground">
                XL
            </Avatar>
        </div>
    ),
};
