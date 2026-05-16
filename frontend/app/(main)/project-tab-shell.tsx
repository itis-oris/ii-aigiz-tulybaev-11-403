'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/shared/ui/header';
import {
    ActiveProjectProvider,
    ProjectTabProvider,
    organizationProjects,
    type ProjectFolder,
    type ProjectTab,
} from '@/shared/lib';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/widgets/app-sidebar';

type ProjectTabShellProps = {
    children: ReactNode;
};

const ProjectTabShell = ({ children }: ProjectTabShellProps) => {
    const [projects, setProjects] = useState(organizationProjects);
    const [folders, setFolders] = useState<ProjectFolder[]>([]);
    const [collapsedFolderIds, setCollapsedFolderIds] = useState<string[]>([]);
    const [activeProjectTab, setActiveProjectTab] =
        useState<ProjectTab>('Задачи');
    const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
    const [activeBoardId, setActiveBoardId] = useState(
        projects[0].boardTabs[0],
    );
    const pathname = usePathname();
    const showHeader = pathname === '/';
    const activeProject =
        projects.find((project) => project.id === activeProjectId) ??
        projects[0];
    const effectiveActiveBoardId = activeProject.boardTabs.includes(
        activeBoardId,
    )
        ? activeBoardId
        : activeProject.boardTabs[0];

    return (
        <ActiveProjectProvider
            value={{
                projects,
                setProjects,
                folders,
                setFolders,
                collapsedFolderIds,
                setCollapsedFolderIds,
                activeProjectId,
                setActiveProjectId,
                activeBoardId: effectiveActiveBoardId,
                setActiveBoardId,
            }}
        >
            <ProjectTabProvider
                value={{ activeProjectTab, setActiveProjectTab }}
            >
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="h-svh min-h-0 overflow-hidden">
                        {showHeader ? (
                            <Header
                                project={activeProject}
                                activeProjectTab={activeProjectTab}
                                onProjectTabChange={setActiveProjectTab}
                            />
                        ) : null}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </ProjectTabProvider>
        </ActiveProjectProvider>
    );
};

export default ProjectTabShell;
