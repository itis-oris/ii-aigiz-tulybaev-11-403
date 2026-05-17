import type { PropsWithChildren } from 'react';
import { QueryProvider } from './query-provider';
import { AuthProvider, LocaleProvider, ThemeProvider } from '../../shared/lib';
import { TooltipProvider } from '../../shared/ui/tooltip';

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryProvider>
            <AuthProvider>
                <LocaleProvider>
                    <ThemeProvider>
                        <TooltipProvider>{children}</TooltipProvider>
                    </ThemeProvider>
                </LocaleProvider>
            </AuthProvider>
        </QueryProvider>
    );
}
