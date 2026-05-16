'use client';

import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/react';
import { cn } from '@/shared/lib';
import { ALL_PROJECTS_ROOT_DROP_ID } from './all-projects-dnd';

type RootDropZoneProps = {
    children: ReactNode;
};

export function RootDropZone({ children }: RootDropZoneProps) {
    const { ref, isDropTarget } = useDroppable({
        id: ALL_PROJECTS_ROOT_DROP_ID,
    });

    return (
        <div
            ref={ref}
            className={cn(
                'rounded-xl bg-background/70 transition-colors',
                isDropTarget && 'bg-sky-50 ring-1 ring-inset ring-sky-300',
            )}
        >
            {children}
        </div>
    );
}
