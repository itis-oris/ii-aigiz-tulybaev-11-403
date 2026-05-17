'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import {
    useI18n,
    useProjectFolderDndController,
    useProjectFolderTree,
    useWorkspaceProjectsController,
} from '@/shared/lib';
import { Button } from '@/shared/ui';
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
    FolderPlus,
    FolderOpen,
    LayoutGrid,
    Plus,
    Search,
    Target,
    UserPlus,
} from 'lucide-react';
import CreateProjectDialog from './create-project-dialog';
import CreateProjectFolderDialog from '@/views/all-projects/ui/create-project-folder-dialog';
import { InviteWorkspaceDialog } from './invite-workspace-dialog';
import { SidebarFolderButton } from './sidebar-folder-button';
import { SidebarProjectLink } from './sidebar-project-link';
import {
    parseSidebarFolderId,
    parseSidebarProjectId,
} from './sidebar-project-dnd';
import { SidebarRootDropZone } from './sidebar-root-drop-zone';
import SidebarProfileMenu from './sidebar-profile-menu';
import WorkspaceSwitcher from './workspace-switcher';

const sidebarMenuItemClassName = 'h-10 rounded-xl px-3 text-sm';
const sidebarActionIconClassName = 'size-4.5 text-sidebar-foreground/75';

export function AppSidebar() {
    const pathname = usePathname();
    const { t } = useI18n();
    const {
        activeProjectId,
        collapsedFolderIds,
        createFolder,
        createProject,
        folders,
        moveProjectToFolder,
        projects,
        selectProject,
        toggleFolder,
    } = useWorkspaceProjectsController();
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
        useState(false);
    const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
        useState(false);
    const { groupedFolders: projectsByFolder, rootProjects } =
        useProjectFolderTree({
            folders,
            projects,
        });
    const {
        draggedProjectId,
        handleDragEnd: handleSidebarDragEnd,
        handleDragStart: handleSidebarDragStart,
    } = useProjectFolderDndController({
        moveProjectToFolder,
        parseProjectId: parseSidebarProjectId,
        parseFolderId: parseSidebarFolderId,
    });
    const primaryItems = [
        { title: t('sidebar.myTasks'), icon: Target, href: '/my-tasks' },
        { title: t('sidebar.allTasks'), icon: LayoutGrid, href: '/all-tasks' },
        {
            title: t('sidebar.allProjects'),
            icon: FolderOpen,
            href: '/all-projects',
        },
    ];

    return (
        <>
            <DragDropProvider
                onDragStart={handleSidebarDragStart}
                onDragEnd={handleSidebarDragEnd}
            >
                <Sidebar
                    collapsible="icon"
                    className="border-r border-sidebar-border bg-sidebar"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                    >
                        <div className="absolute inset-0 bg-sidebar" />
                        <div className="absolute inset-y-0 left-0 w-px bg-sidebar-border/55" />
                        <div className="absolute inset-y-0 right-0 w-px bg-sidebar-border/55" />
                    </div>

                    <SidebarHeader className="relative z-10 gap-3 px-3 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
                        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
                            <WorkspaceSwitcher
                                onInviteClick={() =>
                                    setIsInviteDialogOpen(true)
                                }
                            />

                            <SidebarTrigger className="shrink-0 text-sidebar-foreground/70 group-data-[collapsible=icon]:size-8" />
                        </div>

                        <div className="relative group-data-[collapsible=icon]:hidden">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <SidebarInput
                                placeholder={t('sidebar.searchProjects')}
                                className="h-10 rounded-xl border-sidebar-border bg-sidebar pl-9 text-sm"
                            />
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="relative z-1">
                        <SidebarGroup className="px-3 py-0 group-data-[collapsible=icon]:px-2">
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {primaryItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            {item.href ? (
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={item.title}
                                                    isActive={
                                                        pathname === item.href
                                                    }
                                                    className={
                                                        sidebarMenuItemClassName
                                                    }
                                                >
                                                    <Link href={item.href}>
                                                        <item.icon
                                                            className={
                                                                sidebarActionIconClassName
                                                            }
                                                        />
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                    className={
                                                        sidebarMenuItemClassName
                                                    }
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
                                    {t('sidebar.projects')}
                                </SidebarGroupLabel>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={t('sidebar.addFolder')}
                                        className="size-7 rounded-md text-sidebar-foreground/70"
                                        onClick={() =>
                                            setIsCreateFolderDialogOpen(true)
                                        }
                                    >
                                        <FolderPlus className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={t('sidebar.addProject')}
                                        className="size-7 rounded-md text-sidebar-foreground/70"
                                        onClick={() =>
                                            setIsCreateProjectDialogOpen(true)
                                        }
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>
                            </SidebarGroupContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {draggedProjectId ? (
                                        <div className="px-2 py-1 text-xs text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
                                            {t('sidebar.dragProjectHint')}
                                        </div>
                                    ) : null}

                                    {folders.length ? (
                                        <>
                                            {projectsByFolder.map(
                                                ({ folder, projects }) => (
                                                    <SidebarMenuItem
                                                        key={folder.id}
                                                    >
                                                        <div className="space-y-1">
                                                            <SidebarFolderButton
                                                                folder={folder}
                                                                isCollapsed={collapsedFolderIds.includes(
                                                                    folder.id,
                                                                )}
                                                                itemClassName={
                                                                    sidebarMenuItemClassName
                                                                }
                                                                onToggle={() =>
                                                                    toggleFolder(
                                                                        folder.id,
                                                                    )
                                                                }
                                                            />

                                                            {projects.length &&
                                                            !collapsedFolderIds.includes(
                                                                folder.id,
                                                            ) ? (
                                                                <div className="space-y-1 pl-4 group-data-[collapsible=icon]:hidden">
                                                                    {projects.map(
                                                                        (
                                                                            project,
                                                                        ) => (
                                                                            <SidebarProjectLink
                                                                                key={
                                                                                    project.id
                                                                                }
                                                                                project={
                                                                                    project
                                                                                }
                                                                                activeProjectId={
                                                                                    activeProjectId
                                                                                }
                                                                                pathname={
                                                                                    pathname
                                                                                }
                                                                                itemClassName={
                                                                                    sidebarMenuItemClassName
                                                                                }
                                                                                onProjectSelect={
                                                                                    selectProject
                                                                                }
                                                                                nested
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </SidebarMenuItem>
                                                ),
                                            )}
                                        </>
                                    ) : null}

                                    {folders.length && rootProjects.length ? (
                                        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
                                            <div className="h-px w-full bg-sidebar-border/80" />
                                        </div>
                                    ) : null}

                                    {rootProjects.length ? (
                                        <SidebarRootDropZone>
                                            {rootProjects.map((project) => (
                                                <SidebarMenuItem
                                                    key={project.id}
                                                >
                                                    <SidebarProjectLink
                                                        project={project}
                                                        activeProjectId={
                                                            activeProjectId
                                                        }
                                                        pathname={pathname}
                                                        itemClassName={
                                                            sidebarMenuItemClassName
                                                        }
                                                        onProjectSelect={
                                                            selectProject
                                                        }
                                                    />
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarRootDropZone>
                                    ) : folders.length && draggedProjectId ? (
                                        <SidebarRootDropZone>
                                            <div className="px-2 pt-1 pb-2 group-data-[collapsible=icon]:hidden">
                                                <div className="rounded-xl border border-dashed border-sidebar-border/80 bg-sidebar-accent/30 px-3 py-3 text-xs text-sidebar-foreground/60 transition-colors">
                                                    <div className="font-medium text-sidebar-foreground/72">
                                                        {t(
                                                            'sidebar.outsideFolders',
                                                        )}
                                                    </div>
                                                    <div className="mt-1 leading-relaxed">
                                                        {t(
                                                            'sidebar.outsideFoldersDescription',
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </SidebarRootDropZone>
                                    ) : null}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="relative z-10 mt-auto gap-3 px-3 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={t('sidebar.invite')}
                                    className={sidebarMenuItemClassName}
                                    onClick={() => setIsInviteDialogOpen(true)}
                                >
                                    <UserPlus
                                        className={sidebarActionIconClassName}
                                    />
                                    <span>{t('sidebar.invite')}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>

                        <div className="w-full rounded-xl px-1 py-1">
                            <SidebarProfileMenu
                                email="artem@sprintly.app"
                                initials="AR"
                                label={t('sidebar.profile')}
                            />
                        </div>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
            </DragDropProvider>

            <InviteWorkspaceDialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
            />
            <CreateProjectDialog
                open={isCreateProjectDialogOpen}
                onOpenChange={setIsCreateProjectDialogOpen}
                projectCount={projects.length}
                folders={folders}
                onSubmit={createProject}
            />
            <CreateProjectFolderDialog
                open={isCreateFolderDialogOpen}
                onOpenChange={setIsCreateFolderDialogOpen}
                onSubmit={createFolder}
            />
        </>
    );
}
