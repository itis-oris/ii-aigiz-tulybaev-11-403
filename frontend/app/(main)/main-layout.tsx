import React, { ReactNode } from 'react';
import ProjectTabShell from '@/app/(main)/project-tab-shell';

type Props = {
    children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
    return <ProjectTabShell>{children}</ProjectTabShell>;
};

export default MainLayout;
