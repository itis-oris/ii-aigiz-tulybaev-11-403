'use client';

import Image from 'next/image';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    ApiError,
    updateCurrentUser,
    uploadCurrentUserAvatar,
} from '@/shared/api';
import { getImageUploadError, useAuth, useI18n } from '@/shared/lib';
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
import { LoaderCircle } from 'lucide-react';

const getInitials = (firstname?: string | null, lastname?: string | null) =>
    `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.trim().toUpperCase() || 'U';

const ProfilePage = () => {
    const { t } = useI18n();
    const { user, isLoading, refetchUser } = useAuth();
    const [firstname, setFirstname] = useState<string | null>(null);
    const [lastname, setLastname] = useState<string | null>(null);
    const [middlename, setMiddlename] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const firstnameValue = firstname ?? user?.firstname ?? '';
    const lastnameValue = lastname ?? user?.lastname ?? '';
    const middlenameValue = middlename ?? user?.middlename ?? '';

    const fullName = useMemo(
        () =>
            [firstnameValue, lastnameValue].filter(Boolean).join(' ') ||
            'Профиль',
        [firstnameValue, lastnameValue],
    );
    const isDirty =
        firstnameValue !== (user?.firstname ?? '') ||
        lastnameValue !== (user?.lastname ?? '') ||
        middlenameValue !== (user?.middlename ?? '');

    const updateProfileMutation = useMutation({
        mutationFn: () =>
            updateCurrentUser({
                firstname: firstnameValue,
                lastname: lastnameValue,
                middlename: middlenameValue,
            }),
        onSuccess: async () => {
            setSuccessMessage(t('profile.profileUpdated'));
            await refetchUser();
            setFirstname(null);
            setLastname(null);
            setMiddlename(null);
        },
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: uploadCurrentUserAvatar,
        onSuccess: async () => {
            setAvatarError(null);
            await refetchUser();
        },
        onError: (error) => {
            setAvatarError(
                error instanceof ApiError
                    ? error.message
                    : t('profile.avatarUpdateError'),
            );
        },
    });

    const formError =
        updateProfileMutation.error instanceof ApiError
            ? updateProfileMutation.error.message
            : updateProfileMutation.error
              ? t('profile.profileUpdateError')
              : null;

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        event.target.value = '';
        setSuccessMessage(null);

        if (!file) {
            return;
        }

        const imageError = getImageUploadError(file);
        if (imageError) {
            setAvatarError(imageError);
            return;
        }

        uploadAvatarMutation.mutate(file);
    };

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
                    </div>

                    <Card className="bg-transparent py-0 ring-0">
                        <CardContent className="px-0 py-0">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Avatar
                                        size="2xl"
                                        className="overflow-hidden bg-primary text-base text-primary-foreground"
                                    >
                                        {user?.avatarUrl ? (
                                            <Image
                                                src={user.avatarUrl}
                                                alt={fullName}
                                                fill
                                                unoptimized
                                                sizes="44px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            getInitials(
                                                user?.firstname,
                                                user?.lastname,
                                            )
                                        )}
                                    </Avatar>
                                    {uploadAvatarMutation.isPending ? (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-[1px]">
                                            <LoaderCircle className="size-5 animate-spin text-foreground" />
                                        </div>
                                    ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-xl font-semibold">
                                        {fullName}
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm">
                                        {user?.email ?? 'email@example.com'}
                                    </CardDescription>
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/jpg"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="md"
                                            disabled={
                                                uploadAvatarMutation.isPending
                                            }
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            {t('profile.changeAvatar')}
                                        </Button>
                                        <p className="text-sm text-muted-foreground">
                                            {t('profile.avatarHint')}
                                        </p>
                                    </div>
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
                                    Email
                                </label>
                                <div className="rounded-xl border border-border/70 bg-muted/35 px-4 py-3 text-sm text-foreground">
                                    {user?.email ?? 'email@example.com'}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Email нельзя изменить в профиле.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('profile.firstName')}
                                </label>
                                <Input
                                    uiSize="md"
                                    value={firstnameValue}
                                    onChange={(event) =>
                                        setFirstname(event.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('profile.lastName')}
                                </label>
                                <Input
                                    uiSize="md"
                                    value={lastnameValue}
                                    onChange={(event) =>
                                        setLastname(event.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('profile.middleName')}
                                </label>
                                <Input
                                    uiSize="md"
                                    value={middlenameValue}
                                    onChange={(event) =>
                                        setMiddlename(event.target.value)
                                    }
                                />
                            </div>
                            {formError ? (
                                <p className="text-sm text-destructive">
                                    {formError}
                                </p>
                            ) : null}
                            {avatarError ? (
                                <p className="text-sm text-destructive">
                                    {avatarError}
                                </p>
                            ) : null}
                            {successMessage ? (
                                <p className="text-sm text-emerald-600">
                                    {successMessage}
                                </p>
                            ) : null}
                            <Button
                                size="md"
                                disabled={
                                    !isDirty ||
                                    updateProfileMutation.isPending ||
                                    uploadAvatarMutation.isPending
                                }
                                onClick={() => {
                                    setSuccessMessage(null);
                                    updateProfileMutation.mutate();
                                }}
                            >
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
