import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Plus, Search } from 'lucide-react';
import { Button } from './button';

const meta = {
    title: 'Shared/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        children: 'Создать задачу',
        variant: 'default',
        size: 'md',
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
        </div>
    ),
};

export const WithIcons: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Button size="md">
                <Plus />
                Новая задача
            </Button>
            <Button variant="outline" size="icon" aria-label="Search">
                <Search />
            </Button>
        </div>
    ),
};
