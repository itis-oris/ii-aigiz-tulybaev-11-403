import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './badge';

const meta = {
    title: 'Shared/Badge',
    component: Badge,
    tags: ['autodocs'],
    args: {
        children: 'В работе',
        variant: 'default',
        size: 'default',
    },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="subtle">Subtle</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="sidebar">Sidebar</Badge>
            <Badge shape="pill">Pill</Badge>
        </div>
    ),
};
