import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Separator } from './separator';

const meta = {
    title: 'Shared/Separator',
    component: Separator,
    tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
    render: () => (
        <div className="w-[320px] space-y-3">
            <div className="text-sm font-medium">Overview</div>
            <Separator />
            <div className="text-sm text-muted-foreground">Tasks</div>
        </div>
    ),
};

export const Vertical: Story = {
    render: () => (
        <div className="flex h-16 items-center gap-4">
            <span className="text-sm">Backlog</span>
            <Separator orientation="vertical" />
            <span className="text-sm">In Progress</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Done</span>
        </div>
    ),
};
