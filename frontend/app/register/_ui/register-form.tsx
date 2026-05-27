'use client';

import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ApiError, register } from '@/shared/api';
import { getPostAuthRedirectPath, useAuth, useI18n } from '@/shared/lib';
import { Button, GoogleRecaptcha } from '@/shared/ui';
import {
    AuthCard,
    AuthField,
    AuthFormError,
    AuthFormFooter,
} from '@/widgets/auth-shell';
import { useValidatedForm } from '@/shared/lib/use-validated-form';
import {
    getRegisterFields,
    initialValues,
    validateForm,
} from '@/app/register/_lib/register-form';

export const RegisterForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refetchUser, setToken } = useAuth();
    const { locale, t } = useI18n();
    const [captchaToken, setCaptchaToken] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const invitationToken = searchParams.get('invite')?.trim() || '';
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const registerFields = getRegisterFields(locale);
    const {
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitted,
        isValid,
        resetForm,
        values,
    } = useValidatedForm(initialValues, (values) =>
        validateForm(values, locale),
    );
    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: async (data) => {
            setToken(data.accessToken);
            const user = await refetchUser();
            router.replace(
                invitationToken
                    ? `/invite/${invitationToken}`
                    : getPostAuthRedirectPath(user ?? null),
            );
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : t('auth.registerError'),
            );
        },
    });

    const captchaError = !captchaToken
        ? locale === 'en'
            ? 'Complete reCAPTCHA'
            : 'Пройди reCAPTCHA'
        : null;

    const handleRegisterSubmit: ComponentProps<'form'>['onSubmit'] = async (
        event,
    ) => {
        if (!event) {
            return;
        }

        setSubmitError(null);
        handleSubmit(event);

        if (!isValid || !captchaToken) {
            return;
        }

        await registerMutation.mutateAsync({
            firstname: values.firstname,
            lastname: values.lastname,
            middlename: values.middlename,
            email: values.email,
            password: values.password,
            invitationToken: invitationToken || undefined,
            captchaToken,
        });
    };

    return (
        <AuthCard
            title={t('auth.registerTitle')}
            description={t('auth.registerDescription')}
        >
            <form
                className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
                onSubmit={handleRegisterSubmit}
                noValidate
            >
                {registerFields.map(
                    (field: (typeof registerFields)[number]) => {
                        const fieldName = field.name as keyof typeof values;

                        return (
                            <AuthField
                                key={field.name}
                                autoComplete={field.autoComplete}
                                error={errors[fieldName]}
                                label={field.label}
                                name={field.name}
                                onBlur={handleBlur(fieldName)}
                                onChange={handleChange(fieldName)}
                                placeholder={field.placeholder}
                                type={field.type ?? 'text'}
                                value={values[fieldName]}
                            />
                        );
                    },
                )}

                {siteKey ? (
                    <div className="space-y-2">
                        <GoogleRecaptcha
                            siteKey={siteKey}
                            onChange={setCaptchaToken}
                        />
                        {captchaError ? (
                            <p className="text-sm text-destructive">
                                {captchaError}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <AuthFormError message="NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured" />
                )}

                <AuthFormFooter
                    href={
                        invitationToken
                            ? `/login?invite=${encodeURIComponent(
                                  invitationToken,
                              )}`
                            : '/login'
                    }
                    linkLabel={t('auth.registerFooterLink')}
                    text={t('auth.registerFooterText')}
                />

                {isSubmitted && !isValid && (
                    <AuthFormError message={t('auth.registerError')} />
                )}
                {submitError ? <AuthFormError message={submitError} /> : null}

                <div className="flex gap-3 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="flex-1 text-muted-foreground"
                        onClick={resetForm}
                    >
                        {t('auth.clear')}
                    </Button>
                    <Button
                        type="submit"
                        size="xl"
                        className="flex-1"
                        disabled={registerMutation.isPending || !siteKey}
                    >
                        {t('auth.registerSubmit')}
                    </Button>
                </div>
            </form>
        </AuthCard>
    );
};
