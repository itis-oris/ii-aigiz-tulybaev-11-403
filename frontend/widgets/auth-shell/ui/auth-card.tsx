import type { ReactNode } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

type AuthCardProps = {
    children: ReactNode;
    description: string;
    title: string;
};

export const AuthCard = ({ children, description, title }: AuthCardProps) => {
    return (
        <Card className="relative w-full max-w-md border border-border py-0 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.24)]">
            <CardHeader className="gap-2 border-b border-border px-5 py-4 sm:px-6">
                <CardTitle className="text-2xl font-semibold">
                    {title}
                </CardTitle>
                <CardDescription className="text-sm">
                    {description}
                </CardDescription>
            </CardHeader>
            {children}
        </Card>
    );
};
