import React, { ReactNode } from 'react';
import ProjectTabShell from '@/app/(main)/project-tab-shell';
import { ProtectedGuard } from '@/widgets/auth-shell';

type Props = {
    children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
    return (
        <ProtectedGuard>
            <ProjectTabShell>{children}</ProjectTabShell>
        </ProtectedGuard>
    );
};

export default MainLayout;
