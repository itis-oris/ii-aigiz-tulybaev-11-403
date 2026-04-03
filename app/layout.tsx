import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope, IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/app/providers';
import { siteConfig } from '@/shared/config/site';
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const ibmPlexMono = IBM_Plex_Mono({
    variable: '--font-mono',
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500'],
});

export const metadata: Metadata = {
    title: siteConfig.title,
    description: siteConfig.description,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html
            lang="ru"
            className={cn("h-full", "antialiased", ibmPlexMono.variable, "font-sans", inter.variable)}
        >
            <body className="min-h-full bg-app text-foreground">
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
