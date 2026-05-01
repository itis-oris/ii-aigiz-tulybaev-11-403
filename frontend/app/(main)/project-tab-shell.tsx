'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Header from '@/shared/ui/header';
import { ProjectTabProvider, type ProjectTab } from '@/shared/lib';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/widgets/app-sidebar';

type ProjectTabShellProps = {
    children: ReactNode;
};

const ProjectTabShell = ({ children }: ProjectTabShellProps) => {
    const [activeProjectTab, setActiveProjectTab] =
        useState<ProjectTab>('Задачи');

    return (
        <ProjectTabProvider value={{ activeProjectTab, setActiveProjectTab }}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="h-svh min-h-0 overflow-hidden">
                    <Header
                        activeProjectTab={activeProjectTab}
                        onProjectTabChange={setActiveProjectTab}
                    />
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProjectTabProvider>
    );
};

export default ProjectTabShell;
