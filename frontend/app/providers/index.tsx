import type { PropsWithChildren } from 'react';
import { LocaleProvider, ThemeProvider } from '../../shared/lib';
import { TooltipProvider } from '../../shared/ui/tooltip';

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <LocaleProvider>
            <ThemeProvider>
                <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
        </LocaleProvider>
    );
}
