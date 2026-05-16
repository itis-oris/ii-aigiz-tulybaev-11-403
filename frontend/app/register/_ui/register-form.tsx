'use client';

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
    getRegisterFields,
    initialValues,
    validateForm,
} from '@/app/register/_lib/register-form';

export const RegisterForm = () => {
    const { locale, t } = useI18n();
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

    return (
        <AuthCard
            title={t('auth.registerTitle')}
            description={t('auth.registerDescription')}
        >
            <form
                className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
                onSubmit={handleSubmit}
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

                <AuthFormFooter
                    href="/login"
                    linkLabel={t('auth.registerFooterLink')}
                    text={t('auth.registerFooterText')}
                />

                {isSubmitted && !isValid && (
                    <AuthFormError message={t('auth.registerError')} />
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
                        {t('auth.registerSubmit')}
                    </Button>
                </div>
            </form>
        </AuthCard>
    );
};
