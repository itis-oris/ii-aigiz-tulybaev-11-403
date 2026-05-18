import React from 'react';

export const TaskSheetMetaRow = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex items-center gap-6 border-b border-border/70 pb-5">
        <div className="w-32 shrink-0 text-sm text-muted-foreground">
            {label}
        </div>
        {children}
    </div>
);
