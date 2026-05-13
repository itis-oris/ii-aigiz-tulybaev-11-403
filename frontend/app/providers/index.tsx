import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '../../shared/lib';
import { TooltipProvider } from '../../shared/ui/tooltip';

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
    );
}
