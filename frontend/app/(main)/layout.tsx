import React, { ReactNode } from 'react';
import MainLayout from '@/app/(main)/main-layout';

type Props = {
    children: ReactNode
}

const Layout = ({ children }: Props) => {
    return <MainLayout>{children}</MainLayout>;
};

export default Layout;