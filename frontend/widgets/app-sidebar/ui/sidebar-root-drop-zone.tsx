'use client';

import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/react';
import { cn } from '@/shared/lib';
import { SIDEBAR_ROOT_DROP_ID } from './sidebar-project-dnd';

type SidebarRootDropZoneProps = {
    children: ReactNode;
};

export function SidebarRootDropZone({ children }: SidebarRootDropZoneProps) {
    const { ref, isDropTarget } = useDroppable({
        id: SIDEBAR_ROOT_DROP_ID,
    });

    return (
        <div
            ref={ref}
            className={cn(
                'rounded-xl transition-colors',
                isDropTarget && 'bg-sidebar-accent/70',
            )}
        >
            {children}
        </div>
    );
}
