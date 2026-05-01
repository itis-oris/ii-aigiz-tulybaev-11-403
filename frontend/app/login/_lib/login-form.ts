import type { AuthFieldConfig, FieldErrors } from '@/widgets/auth-shell';
import { validateEmail, validatePassword } from '@/widgets/auth-shell';

export type LoginValues = {
    email: string;
    password: string;
};

export const loginFields: readonly AuthFieldConfig<keyof LoginValues>[] = [
    {
        name: 'email',
        label: 'Email',
        placeholder: 'user@example.com',
        type: 'email',
        autoComplete: 'email',
    },
    {
        name: 'password',
        label: 'Пароль',
        placeholder: 'Введите пароль',
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
): FieldErrors<keyof LoginValues> => {
    const errors: FieldErrors<keyof LoginValues> = {};

    const emailError = validateEmail(values.email);
    if (emailError) {
        errors.email = emailError;
    }

    const passwordError = validatePassword(values.password);
    if (passwordError) {
        errors.password = passwordError;
    }

    return errors;
};
