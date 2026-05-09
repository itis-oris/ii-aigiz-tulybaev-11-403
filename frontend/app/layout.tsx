import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Mono, Inter, Geist } from 'next/font/google';
import { AppProviders } from '@/app/providers';
import { siteConfig } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import './globals.css';

const geistHeading = Geist({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-heading',
});

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: '--font-mono',
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500'],
});

export const metadata: Metadata = {
    title: siteConfig.title,
    description: siteConfig.description,
    icons: {
        icon: '/img/favicon.webp',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html
            lang="ru"
            className={cn(
                inter.variable,
                ibmPlexMono.variable,
                geistHeading.variable,
            )}
        >
            <body className="min-h-full antialiased">
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
