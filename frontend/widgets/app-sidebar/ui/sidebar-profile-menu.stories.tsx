import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SidebarProvider } from '@/shared/ui/sidebar';
import SidebarProfileMenu from './sidebar-profile-menu';

const meta = {
    title: 'Widgets/SidebarProfileMenu',
    component: SidebarProfileMenu,
    tags: ['autodocs'],
    args: {
        label: 'Профиль',
        email: 'user@example.com',
        initials: 'LI',
        avatarUrl: null,
    },
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof SidebarProfileMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <SidebarProvider defaultOpen>
            <div className="w-[280px] rounded-2xl bg-sidebar p-2">
                <SidebarProfileMenu {...args} />
            </div>
        </SidebarProvider>
    ),
};
