'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/shared/ui/header';
import {
    ActiveProjectProvider,
    ProjectTabProvider,
    organizationProjects,
    type ProjectTab,
} from '@/shared/lib';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/widgets/app-sidebar';

type ProjectTabShellProps = {
    children: ReactNode;
};

const ProjectTabShell = ({ children }: ProjectTabShellProps) => {
    const [activeProjectTab, setActiveProjectTab] =
        useState<ProjectTab>('Задачи');
    const [activeProjectId, setActiveProjectId] = useState(
        organizationProjects[0].id,
    );
    const pathname = usePathname();
    const showHeader = pathname === '/';
    const activeProject =
        organizationProjects.find(
            (project) => project.id === activeProjectId,
        ) ?? organizationProjects[0];

    return (
        <ActiveProjectProvider value={{ activeProjectId, setActiveProjectId }}>
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
