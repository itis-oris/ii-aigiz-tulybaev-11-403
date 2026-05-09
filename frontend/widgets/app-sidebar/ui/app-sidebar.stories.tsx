import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { AppSidebar } from './app-sidebar';

const meta = {
    title: 'Widgets/AppSidebar',
    component: AppSidebar,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof AppSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <SidebarProvider defaultOpen>
            <div className="flex min-h-[780px] w-full bg-sidebar">
                <AppSidebar />
                <SidebarInset>
                    <div className="border-b border-border px-6 py-4 text-sm font-medium">
                        Project workspace
                    </div>
                    <div className="p-6 text-sm text-muted-foreground">
                        Пустая область контента для визуальной проверки
                        сайдбара.
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    ),
};
