'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn, useI18n, useTheme } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/shared/ui/sidebar';
import { Languages, LogOut, MoonStar, Settings2 } from 'lucide-react';

type SidebarProfileMenuProps = {
    email: string;
    initials: string;
    label: string;
};

function SidebarProfileMenuContent({
    email,
    initials,
    label,
}: SidebarProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { locale, mounted: localeMounted, t, toggleLocale } = useI18n();
    const { mounted, theme, toggleTheme } = useTheme();
    const themeLabel = !mounted
        ? t('common.light')
        : theme === 'dark'
          ? t('common.dark')
          : t('common.light');
    const languageLabel = !localeMounted ? 'RU' : locale === 'en' ? 'EN' : 'RU';

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    'absolute -right-6 bottom-full z-30 mb-2 w-64 origin-bottom-right rounded-2xl border border-sidebar-border bg-sidebar p-2 shadow-lg transition-all duration-200',
                    isOpen
                        ? 'translate-y-0 scale-100 opacity-100'
                        : 'pointer-events-none translate-y-2 scale-95 opacity-0',
                )}
            >
                <div className="mb-2 border-b border-sidebar-border px-3 py-2">
                    <div className="truncate text-sm font-medium">{label}</div>
                    <div className="truncate text-xs text-muted-foreground">
                        {email}
                    </div>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="h-10 rounded-xl px-3 text-sm"
                        >
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings2 className="size-4 text-sidebar-foreground/75" />
                                <span>{t('sidebar.settings')}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="h-10 rounded-xl px-3 text-sm"
                            onClick={toggleTheme}
                        >
                            <MoonStar className="size-4 text-sidebar-foreground/75" />
                            <span>{t('sidebar.theme')}</span>
                            <span className="ml-auto text-xs text-sidebar-foreground/55">
                                {themeLabel}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="h-10 rounded-xl px-3 text-sm"
                            onClick={toggleLocale}
                        >
                            <Languages className="size-4 text-sidebar-foreground/75" />
                            <span>{t('sidebar.language')}</span>
                            <span className="ml-auto text-xs text-sidebar-foreground/55">
                                {languageLabel}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="h-10 rounded-xl px-3 text-sm text-destructive hover:text-destructive"
                        >
                            <Link
                                href="/landing"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogOut className="size-4" />
                                <span>{t('sidebar.logout')}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>

            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-label={t('sidebar.openProfileMenu')}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent"
            >
                <Avatar
                    size="md"
                    className="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                    {initials}
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <div className="truncate text-sm font-medium text-sidebar-foreground">
                        {label}
                    </div>
                    <div className="truncate text-xs text-sidebar-foreground/55">
                        {t('sidebar.superAdmin')}
                    </div>
                </div>
                <span className="sr-only">
                    {isOpen
                        ? t('sidebar.closeProfileMenu')
                        : t('sidebar.openProfileMenu')}
                </span>
            </button>
        </div>
    );
}

const SidebarProfileMenu = (props: SidebarProfileMenuProps) => {
    const { state } = useSidebar();

    return <SidebarProfileMenuContent key={state} {...props} />;
};

export default SidebarProfileMenu;
