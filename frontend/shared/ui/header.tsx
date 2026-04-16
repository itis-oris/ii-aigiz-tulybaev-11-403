import React from 'react';

import { cn } from '@/shared/lib/utils';

type HeaderProps = React.ComponentProps<'header'>;

const Header = ({ className, children, ...props }: HeaderProps) => {
    return (
        <header
            className={cn(
                'flex h-14 w-full items-center border-b border-sidebar-border bg-sidebar px-6 text-sidebar-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </header>
    );
};

export default Header;
