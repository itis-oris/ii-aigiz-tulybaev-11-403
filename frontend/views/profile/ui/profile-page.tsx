'use client';

import { useCurrentUser, useI18n } from '@/shared/lib';
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

const getInitials = (firstname?: string, lastname?: string) =>
    `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.trim().toUpperCase() || 'U';

const ProfilePage = () => {
    const { t } = useI18n();
    const { data: user, isLoading, isError } = useCurrentUser();
    const fullName =
        [user?.firstname, user?.lastname].filter(Boolean).join(' ') ||
        'Профиль';
    const role = user?.roles?.[0] ?? 'User';

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
                        {isLoading ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Загрузка профиля...
                            </p>
                        ) : null}
                        {isError ? (
                            <p className="mt-2 text-sm text-destructive">
                                Не удалось получить данные с backend.
                            </p>
                        ) : null}
                    </div>

                    <Card className="bg-transparent py-0 ring-0">
                        <CardContent className="px-0 py-0">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <Avatar
                                    size="2xl"
                                    className="bg-primary text-base text-primary-foreground"
                                >
                                    {getInitials(
                                        user?.firstname,
                                        user?.lastname,
                                    )}
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-xl font-semibold">
                                        {fullName}
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm">
                                        {user?.email ?? 'email@example.com'}
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
                                <Input
                                    uiSize="md"
                                    value={user?.firstname ?? ''}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    uiSize="md"
                                    value={user?.email ?? ''}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('profile.role')}
                                </label>
                                <Input uiSize="md" value={role} readOnly />
                            </div>
                            <Button size="md" disabled>
                                {t('common.saveChanges')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
