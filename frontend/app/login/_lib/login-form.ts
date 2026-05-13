import type { Locale } from '@/shared/lib/i18n';
import type { AuthFieldConfig, FieldErrors } from '@/widgets/auth-shell';
import { validateEmail, validatePassword } from '@/widgets/auth-shell';

export type LoginValues = {
    email: string;
    password: string;
};

export const getLoginFields = (
    locale: Locale,
): readonly AuthFieldConfig<keyof LoginValues>[] =>
    [
        {
            name: 'email',
            label: 'Email',
            placeholder: 'user@example.com',
            type: 'email',
            autoComplete: 'email',
        },
        {
            name: 'password',
            label: locale === 'en' ? 'Password' : 'Пароль',
            placeholder: locale === 'en' ? 'Enter password' : 'Введите пароль',
            type: 'password',
            autoComplete: 'current-password',
        },
    ] as const;

export const initialLoginValues: LoginValues = {
    email: '',
    password: '',
};

export const validateLoginForm = (
    values: LoginValues,
    locale: Locale,
): FieldErrors<keyof LoginValues> => {
    const errors: FieldErrors<keyof LoginValues> = {};

    const emailError = validateEmail(values.email, locale);
    if (emailError) {
        errors.email = emailError;
    }

    const passwordError = validatePassword(values.password, locale);
    if (passwordError) {
        errors.password = passwordError;
    }

    return errors;
};
