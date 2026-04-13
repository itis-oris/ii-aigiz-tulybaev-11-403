import React, { ReactNode } from 'react';
import Header from '@/shared/ui/header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';

type Props = {
    children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <Header />
                <div className="flex-1">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;
