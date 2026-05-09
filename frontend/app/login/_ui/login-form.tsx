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
import {
    initialLoginValues,
    loginFields,
    validateLoginForm,
} from '@/app/login/_lib/login-form';

export const LoginForm = () => {
    const router = useRouter();
    const {
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitted,
        isValid,
        resetForm,
        values,
    } = useValidatedForm(initialLoginValues, validateLoginForm);

    const handleLoginSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
        handleSubmit(event);

        if (isValid) {
            router.push('/');
        }
    };

    return (
        <AuthCard title="Вход" description="Авторизация в рабочем пространстве">
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
                    linkLabel="страницу регистрации"
                    text="Нет аккаунта? Перейдите на"
                />

                {isSubmitted && !isValid && (
                    <AuthFormError message="Проверьте корректность введённых данных." />
                )}

                <div className="flex gap-3 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="flex-1 text-muted-foreground"
                        onClick={resetForm}
                    >
                        Очистить
                    </Button>
                    <Button type="submit" size="xl" className="flex-1">
                        Войти
                    </Button>
                </div>
            </form>
        </AuthCard>
    );
};
