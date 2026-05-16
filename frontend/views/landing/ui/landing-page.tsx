'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import { useI18n } from '@/shared/lib';
import { Button } from '@/shared/ui';

const LandingPage = () => {
    const { t } = useI18n();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex items-center px-6 py-10 sm:px-10 lg:justify-center lg:px-16 xl:px-24">
                    <div className="max-w-3xl space-y-10">
                        <div className="space-y-5">
                            <div className="text-base font-medium text-primary">
                                {t('landing.eyebrow')}
                            </div>
                            <h1 className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
                                Sprintly
                            </h1>
                            <p className="max-w-2xl text-xl leading-9 text-muted-foreground sm:text-2xl">
                                {t('landing.description')}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button asChild size="xl">
                                <Link href="/register">
                                    <UserPlus className="size-4 text-white" />
                                    <span className="text-white">
                                        {t('landing.register')}
                                    </span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="xl">
                                <Link href="/login">
                                    <LogIn className="size-4" />
                                    {t('landing.login')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-[44vh] items-end justify-end overflow-hidden lg:min-h-screen">
                    <Image
                        src="/img/home.png"
                        alt={t('landing.imageAlt')}
                        width={1024}
                        height={1536}
                        className="h-auto max-h-[44vh] w-auto sm:max-h-[52vh] lg:h-screen lg:max-h-none lg:w-auto lg:max-w-none"
                        priority
                    />
                </div>
            </div>
        </main>
    );
};

export default LandingPage;
