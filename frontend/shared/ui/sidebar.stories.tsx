import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FolderKanban, LayoutGrid, Plus, Target, UserPlus } from 'lucide-react';
import { Avatar } from './avatar';
import { Button } from './button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from './sidebar';

const meta = {
    title: 'Shared/Sidebar',
    component: SidebarProvider,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof SidebarProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

function SidebarDemo({ defaultOpen = true }: { defaultOpen?: boolean }) {
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex min-h-[720px] w-full bg-sidebar">
                <Sidebar collapsible="icon">
                    <SidebarHeader>
                        <div className="flex items-center gap-2">
                            <Avatar
                                size="sm"
                                shape="square"
                                className="bg-primary text-primary-foreground"
                            >
                                SP
                            </Avatar>
                            <div className="group-data-[collapsible=icon]:hidden">
                                <div className="text-sm font-semibold">
                                    Sprintly
                                </div>
                                <div className="text-xs text-sidebar-foreground/60">
                                    Workspace
                                </div>
                            </div>
                            <SidebarTrigger className="ml-auto" />
                        </div>
                        <SidebarInput placeholder="Поиск" />
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Навигация</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive
                                            tooltip="Мои задачи"
                                        >
                                            <Target />
                                            <span>Мои задачи</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuBadge>8</SidebarMenuBadge>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Все проекты">
                                            <LayoutGrid />
                                            <span>Все проекты</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuAction showOnHover>
                                            <Plus />
                                        </SidebarMenuAction>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel>Команда</SidebarGroupLabel>
                            <SidebarGroupAction>
                                <UserPlus />
                            </SidebarGroupAction>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Design">
                                            <FolderKanban />
                                            <span>Design System</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive
                                                    href="#"
                                                >
                                                    Tokens
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton href="#">
                                                    Components
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </SidebarMenuItem>
                                    <SidebarMenuSkeleton showIcon />
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <Button
                            variant="ghost"
                            className="justify-start group-data-[collapsible=icon]:justify-center"
                        >
                            <UserPlus />
                            <span className="group-data-[collapsible=icon]:hidden">
                                Пригласить
                            </span>
                        </Button>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset className="min-h-[720px]">
                    <div className="border-b border-border px-4 py-3 text-sm font-medium">
                        Рабочая область
                    </div>
                    <div className="flex-1 p-4 text-sm text-muted-foreground">
                        Контент экрана рядом с сайдбаром.
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

export const Expanded: Story = {
    render: () => <SidebarDemo />,
};

export const Collapsed: Story = {
    render: () => <SidebarDemo defaultOpen={false} />,
};
