import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthBackground } from './auth-background';

const meta = {
    title: 'Widgets/AuthBackground',
    component: AuthBackground,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof AuthBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div className="relative min-h-[720px] overflow-hidden bg-background">
            <AuthBackground />
        </div>
    ),
};
