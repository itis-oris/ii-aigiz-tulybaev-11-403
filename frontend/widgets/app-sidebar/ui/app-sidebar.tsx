'use client';

import type { ProjectSummary } from '@/shared/lib';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { organizationProjects, useActiveProject } from '@/shared/lib';
import { Avatar, Button } from '@/shared/ui';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
} from '@/shared/ui/sidebar';
import {
    ChevronDown,
    FolderOpen,
    LayoutGrid,
    Plus,
    Search,
    Settings2,
    Target,
    UserPlus,
} from 'lucide-react';
import { cn } from '@/shared/lib';
import SidebarProfileMenu from './sidebar-profile-menu';

const primaryItems = [
    { title: 'Мои задачи', icon: Target, href: '/my-tasks' },
    { title: 'Все задачи', icon: LayoutGrid, href: '/all-tasks' },
    { title: 'Все проекты', icon: FolderOpen, href: '/all-projects' },
];

const sidebarMenuItemClassName = 'h-10 rounded-xl px-3 text-sm';
const sidebarActionIconClassName = 'size-4.5 text-sidebar-foreground/75';

type WorkspaceSwitcherProps = {
    label: string;
    shortLabel: string;
    projects: ProjectSummary[];
    activeProjectId: string;
    onProjectSelect: (projectId: string) => void;
};

function WorkspaceSwitcher({
    label,
    shortLabel,
    projects,
    activeProjectId,
    onProjectSelect,
}: WorkspaceSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative min-w-0 flex-1">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-label="Открыть меню организации"
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
                <Avatar
                    size="sm"
                    shape="square"
                    className="bg-sidebar-accent text-sidebar-foreground"
                >
                    {shortLabel}
                </Avatar>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="truncate text-sm font-semibold text-sidebar-foreground">
                        {label}
                    </div>
                </div>
                <ChevronDown className="ml-auto size-4 text-sidebar-foreground/65 group-data-[collapsible=icon]:hidden" />
            </button>

            <div
                className={cn(
                    'absolute top-full left-0 z-40 mt-2 hidden w-[17.5rem] rounded-2xl border border-sidebar-border bg-sidebar p-3 shadow-lg',
                    'group-data-[collapsible=icon]:hidden',
                    isOpen && 'block',
                )}
            >
                <div className="flex items-start gap-3 rounded-xl px-1 pb-3">
                    <Avatar
                        size="md"
                        shape="square"
                        className="bg-sidebar-accent text-sidebar-foreground"
                    >
                        {shortLabel}
                    </Avatar>
                    <div className="min-w-0">
                        <div className="truncate text-[1.05rem] font-medium text-sidebar-foreground">
                            {label}
                        </div>
                        <div className="text-sm text-sidebar-foreground/55">
                            Супер-админ • {projects.length + 1} участник
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pb-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-sidebar-border bg-sidebar px-3 text-sm"
                    >
                        <Settings2 className="size-4" />
                        <span>Настройки</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-sidebar-border bg-sidebar px-3 text-sm"
                    >
                        <UserPlus className="size-4" />
                        <span>Пригласить</span>
                    </Button>
                </div>

                <div className="border-t border-sidebar-border pt-3">
                    <div className="space-y-0.5">
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
                            onClick={() => setIsOpen(false)}
                        >
                            <Avatar
                                size="xs"
                                shape="square"
                                className="bg-sidebar-accent text-sidebar-foreground"
                            >
                                {shortLabel}
                            </Avatar>
                            <span className="truncate text-sm text-sidebar-foreground/75">
                                {label}
                            </span>
                        </button>

                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href="/"
                                onClick={() => {
                                    onProjectSelect(project.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent',
                                    activeProjectId === project.id &&
                                        'bg-sidebar-accent/70',
                                )}
                            >
                                <Avatar
                                    size="xs"
                                    shape="square"
                                    className={cn(project.avatarClassName)}
                                >
                                    {project.avatar}
                                </Avatar>
                                <span className="truncate text-sm text-sidebar-foreground">
                                    {project.name}
                                </span>
                            </Link>
                        ))}

                        <button
                            type="button"
                            className="w-full rounded-xl px-2 py-2 text-left text-sm text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            Новое пространство
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AppSidebar() {
    const pathname = usePathname();
    const { activeProjectId, setActiveProjectId } = useActiveProject();

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="gap-3 px-3 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
                    <WorkspaceSwitcher
                        label="Campus"
                        shortLabel="C"
                        projects={organizationProjects}
                        activeProjectId={activeProjectId}
                        onProjectSelect={setActiveProjectId}
                    />

                    <SidebarTrigger className="shrink-0 text-sidebar-foreground/70 group-data-[collapsible=icon]:size-8" />
                </div>

                <div className="relative group-data-[collapsible=icon]:hidden">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <SidebarInput
                        placeholder="Проект..."
                        className="h-10 rounded-xl border-sidebar-border bg-sidebar pl-9 text-sm"
                    />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="px-3 py-0 group-data-[collapsible=icon]:px-2">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {primaryItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.href ? (
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={pathname === item.href}
                                            className={sidebarMenuItemClassName}
                                        >
                                            <Link href={item.href}>
                                                <item.icon
                                                    className={
                                                        sidebarActionIconClassName
                                                    }
                                                />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    ) : (
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            className={sidebarMenuItemClassName}
                                        >
                                            <item.icon
                                                className={
                                                    sidebarActionIconClassName
                                                }
                                            />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="my-3" />

                <SidebarGroup className="px-3 group-data-[collapsible=icon]:px-2">
                    <SidebarGroupContent className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
                        <SidebarGroupLabel className="h-7 px-2 text-sm text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
                            Проекты
                        </SidebarGroupLabel>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Добавить проект"
                            className="size-7 rounded-md text-sidebar-foreground/70"
                        >
                            <Plus className="size-4" />
                        </Button>
                    </SidebarGroupContent>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {organizationProjects.map((project) => (
                                <SidebarMenuItem key={project.id}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={project.name}
                                        isActive={
                                            pathname === '/' &&
                                            activeProjectId === project.id
                                        }
                                        className={sidebarMenuItemClassName}
                                    >
                                        <Link
                                            href="/"
                                            onClick={() =>
                                                setActiveProjectId(project.id)
                                            }
                                        >
                                            <Avatar
                                                size="xs"
                                                shape="square"
                                                className={cn(
                                                    project.avatarClassName,
                                                )}
                                            >
                                                {project.avatar}
                                            </Avatar>
                                            <span>{project.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mt-auto gap-3 px-3 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Пригласить"
                            className={sidebarMenuItemClassName}
                        >
                            <UserPlus className={sidebarActionIconClassName} />
                            <span>Пригласить</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="w-full rounded-xl px-1 py-1">
                    <SidebarProfileMenu
                        email="artem@sprintly.app"
                        initials="AR"
                        label="Профиль"
                    />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
