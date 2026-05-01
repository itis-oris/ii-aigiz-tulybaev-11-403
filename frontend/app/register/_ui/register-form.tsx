'use client';

import { Button } from '@/shared/ui';
import {
    AuthCard,
    AuthField,
    AuthFormError,
    AuthFormFooter,
} from '@/widgets/auth-shell';
import { useValidatedForm } from '@/shared/lib/use-validated-form';
import {
    initialValues,
    registerFields,
    validateForm,
} from '@/app/register/_lib/register-form';

export const RegisterForm = () => {
    const {
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitted,
        isValid,
        resetForm,
        values,
    } = useValidatedForm(initialValues, validateForm);

    return (
        <AuthCard
            title="Регистрация"
            description="Создание нового аккаунта в рабочем пространстве"
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
                    linkLabel="страницу входа"
                    text="Уже есть аккаунт? Перейдите на"
                />

                {isSubmitted && !isValid && (
                    <AuthFormError message="Проверьте обязательные поля формы." />
                )}

                <div className="flex gap-3 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 rounded-md text-sm text-muted-foreground"
                        onClick={resetForm}
                    >
                        Очистить
                    </Button>
                    <Button
                        type="submit"
                        className="h-10 flex-1 rounded-md text-sm"
                    >
                        Создать аккаунт
                    </Button>
                </div>
            </form>
        </AuthCard>
    );
};
