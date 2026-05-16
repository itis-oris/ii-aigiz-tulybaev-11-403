'use client';

import { useI18n } from '@/shared/lib';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
} from '@/shared/ui';

const ProfilePage = () => {
    const { t } = useI18n();

    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">
                            {t('profile.title')}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('profile.description')}
                        </p>
                    </div>

                    <Card className="bg-transparent py-0 ring-0">
                        <CardContent className="px-0 py-0">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <Avatar
                                    size="2xl"
                                    className="bg-primary text-base text-primary-foreground"
                                >
                                    LI
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-xl font-semibold">
                                        Lorem Ipsum
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm">
                                        lorem.ipsum@example.com
                                    </CardDescription>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-transparent py-0 ring-0">
                        <CardHeader className="px-0 py-0">
                            <CardTitle>{t('profile.general')}</CardTitle>
                            <CardDescription>
                                {t('profile.generalDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-0 py-0">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('profile.firstName')}
                                </label>
                                <Input uiSize="md" defaultValue="Lorem Ipsum" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    uiSize="md"
                                    defaultValue="lorem.ipsum@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('profile.role')}
                                </label>
                                <Input
                                    uiSize="md"
                                    defaultValue="Product Owner"
                                />
                            </div>
                            <Button size="md">{t('common.saveChanges')}</Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
