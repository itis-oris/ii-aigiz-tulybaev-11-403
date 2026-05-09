import type { ReactNode } from 'react';

type AuthPageShellProps = {
    children: ReactNode;
};

export const AuthPageShell = ({ children }: AuthPageShellProps) => {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground">
            {children}
        </main>
    );
};
