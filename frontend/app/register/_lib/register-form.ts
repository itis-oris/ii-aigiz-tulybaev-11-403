import type { AuthFieldConfig, FieldErrors } from '@/widgets/auth-shell';
import {
    validateEmail,
    validatePassword,
    validateRequired,
} from '@/widgets/auth-shell';

export type FormValues = {
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type FormErrors = FieldErrors<keyof FormValues>;

export const registerFields: readonly AuthFieldConfig<keyof FormValues>[] = [
    {
        name: 'firstname',
        label: 'Имя',
        placeholder: 'Андрей',
        autoComplete: 'given-name',
    },
    {
        name: 'lastname',
        label: 'Фамилия',
        placeholder: 'Иванов',
        autoComplete: 'family-name',
    },
    {
        name: 'middlename',
        label: 'Отчество',
        placeholder: 'Иванович',
        autoComplete: 'additional-name',
    },
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
        placeholder: 'Не менее 6 символов',
        type: 'password',
        autoComplete: 'new-password',
    },
    {
        name: 'confirmPassword',
        label: 'Подтверждение пароля',
        placeholder: 'Повторите пароль',
        type: 'password',
        autoComplete: 'new-password',
    },
] as const;

export const initialValues: FormValues = {
    firstname: '',
    lastname: '',
    middlename: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export const validateForm = (values: FormValues): FormErrors => {
    const errors: FormErrors = {};

    const firstnameError = validateRequired(values.firstname, 'Введите имя');
    if (firstnameError) {
        errors.firstname = firstnameError;
    }

    const lastnameError = validateRequired(values.lastname, 'Введите фамилию');
    if (lastnameError) {
        errors.lastname = lastnameError;
    }

    const emailError = validateEmail(values.email);
    if (emailError) {
        errors.email = emailError;
    }

    const passwordError = validatePassword(values.password);
    if (passwordError) {
        errors.password = passwordError;
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = 'Подтвердите пароль';
    } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают';
    }

    return errors;
};
