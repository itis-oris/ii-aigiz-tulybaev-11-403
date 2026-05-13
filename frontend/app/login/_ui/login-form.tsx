'use client';

import type { ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import {
    AuthCard,
    AuthField,
    AuthFormError,
    AuthFormFooter,
} from '@/widgets/auth-shell';
import { useValidatedForm } from '@/shared/lib/use-validated-form';
import { useI18n } from '@/shared/lib';
import {
    initialLoginValues,
    getLoginFields,
    validateLoginForm,
} from '@/app/login/_lib/login-form';

export const LoginForm = () => {
    const router = useRouter();
    const { locale, t } = useI18n();
    const loginFields = getLoginFields(locale);
    const {
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitted,
        isValid,
        resetForm,
        values,
    } = useValidatedForm(initialLoginValues, (values) =>
        validateLoginForm(values, locale),
    );

    const handleLoginSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
        handleSubmit(event);

        if (isValid) {
            router.push('/');
        }
    };

    return (
        <AuthCard
            title={t('auth.loginTitle')}
            description={t('auth.loginDescription')}
        >
            <form
                className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
                onSubmit={handleLoginSubmit}
                noValidate
            >
                {loginFields.map((field: (typeof loginFields)[number]) => {
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
                })}

                <AuthFormFooter
                    href="/register"
                    linkLabel={t('auth.loginFooterLink')}
                    text={t('auth.loginFooterText')}
                />

                {isSubmitted && !isValid && (
                    <AuthFormError message={t('auth.loginError')} />
                )}

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
                    <Button type="submit" size="xl" className="flex-1">
                        {t('auth.loginSubmit')}
                    </Button>
                </div>
            </form>
        </AuthCard>
    );
};
