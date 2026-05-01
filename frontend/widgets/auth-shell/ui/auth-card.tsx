import type { ReactNode } from 'react';

type AuthCardProps = {
    children: ReactNode;
    description: string;
    title: string;
};

export const AuthCard = ({ children, description, title }: AuthCardProps) => {
    return (
        <div className="relative w-full max-w-md rounded-lg border border-border bg-card shadow-[0_18px_48px_-24px_rgba(15,23,42,0.24)]">
            <div className="border-b border-border px-5 py-4 sm:px-6">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {children}
        </div>
    );
};
