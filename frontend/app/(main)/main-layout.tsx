import React, { ReactNode } from 'react';
import Header from '@/shared/ui/header';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/widgets/app-sidebar';

type Props = {
    children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-svh min-h-0 overflow-hidden">
                <Header />
                <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;
