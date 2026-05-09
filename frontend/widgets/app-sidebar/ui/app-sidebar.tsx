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
    BriefcaseBusiness,
    ChevronDown,
    FolderKanban,
    FolderOpen,
    LayoutGrid,
    Plus,
    Search,
    Target,
    UserPlus,
} from 'lucide-react';
import { cn } from '@/shared/lib';

const primaryItems = [
    { title: 'Мои задачи', icon: Target, isActive: false },
    { title: 'Все задачи', icon: LayoutGrid, isActive: false },
    { title: 'Все проекты', icon: FolderOpen, isActive: false },
];

const projectItems = [
    {
        title: 'Develop',
        avatar: 'DE',
        avatarClassName: 'bg-amber-100 text-amber-700',
        isActive: true,
    },
    {
        title: 'Mobile App',
        avatar: 'MA',
        avatarClassName: 'bg-sky-100 text-sky-700',
        isActive: false,
    },
    {
        title: 'Marketing Site',
        avatar: 'MS',
        avatarClassName: 'bg-emerald-100 text-emerald-700',
        isActive: false,
    },
];

const sidebarMenuItemClassName = 'h-10 rounded-xl px-3 text-sm';
const sidebarActionIconClassName = 'size-4.5 text-sidebar-foreground/75';

type WorkspaceSwitcherProps = {
    label: string;
    shortLabel: string;
};

function WorkspaceSwitcher({ label, shortLabel }: WorkspaceSwitcherProps) {
    return (
        <button className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
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
    );
}

type SidebarProfileButtonProps = {
    email: string;
    initials: string;
    label: string;
};

function SidebarProfileButton({
    email,
    initials,
    label,
}: SidebarProfileButtonProps) {
    return (
        <button className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Avatar
                size="md"
                className="bg-[linear-gradient(135deg,#171717,#525252)] text-white"
            >
                {initials}
            </Avatar>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="truncate text-left text-sm font-medium">
                    {label}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                    {email}
                </div>
            </div>
        </button>
    );
}

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="gap-3 px-3 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
                    <WorkspaceSwitcher label="Campus" shortLabel="C" />

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
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={item.isActive}
                                        className={sidebarMenuItemClassName}
                                    >
                                        <item.icon
                                            className={
                                                sidebarActionIconClassName
                                            }
                                        />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
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
                            {projectItems.map((project) => (
                                <SidebarMenuItem key={project.title}>
                                    <SidebarMenuButton
                                        tooltip={project.title}
                                        isActive={project.isActive}
                                        className={sidebarMenuItemClassName}
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
                                        <span>{project.title}</span>
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

                <div className="flex items-center gap-2 rounded-xl px-1 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
                    <SidebarProfileButton
                        email="artem@sprintly.app"
                        initials="AR"
                        label="Профиль"
                    />

                    <div className="hidden items-center gap-1 group-data-[collapsible=icon]:hidden">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Проекты"
                        >
                            <BriefcaseBusiness className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Рабочее пространство"
                        >
                            <FolderKanban className="size-4" />
                        </Button>
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
