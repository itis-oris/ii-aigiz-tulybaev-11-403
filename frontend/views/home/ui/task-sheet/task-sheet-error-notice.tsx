import React from 'react';

export const TaskSheetErrorNotice = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {children}
    </div>
);
