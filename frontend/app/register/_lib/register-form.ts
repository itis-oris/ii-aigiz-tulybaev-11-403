import type { Locale } from '@/shared/lib/i18n';
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

export const getRegisterFields = (
    locale: Locale,
): readonly AuthFieldConfig<keyof FormValues>[] =>
    [
        {
            name: 'firstname',
            label: locale === 'en' ? 'First name' : 'Имя',
            placeholder: locale === 'en' ? 'Andrew' : 'Андрей',
            autoComplete: 'given-name',
        },
        {
            name: 'lastname',
            label: locale === 'en' ? 'Last name' : 'Фамилия',
            placeholder: locale === 'en' ? 'Ivanov' : 'Иванов',
            autoComplete: 'family-name',
        },
        {
            name: 'middlename',
            label: locale === 'en' ? 'Middle name' : 'Отчество',
            placeholder: locale === 'en' ? 'Ivanovich' : 'Иванович',
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
            label: locale === 'en' ? 'Password' : 'Пароль',
            placeholder:
                locale === 'en'
                    ? 'At least 6 characters'
                    : 'Не менее 6 символов',
            type: 'password',
            autoComplete: 'new-password',
        },
        {
            name: 'confirmPassword',
            label:
                locale === 'en' ? 'Confirm password' : 'Подтверждение пароля',
            placeholder:
                locale === 'en' ? 'Repeat password' : 'Повторите пароль',
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

export const validateForm = (
    values: FormValues,
    locale: Locale,
): FormErrors => {
    const errors: FormErrors = {};

    const firstnameError = validateRequired(
        values.firstname,
        locale === 'en' ? 'Enter first name' : 'Введите имя',
    );
    if (firstnameError) {
        errors.firstname = firstnameError;
    }

    const lastnameError = validateRequired(
        values.lastname,
        locale === 'en' ? 'Enter last name' : 'Введите фамилию',
    );
    if (lastnameError) {
        errors.lastname = lastnameError;
    }

    const emailError = validateEmail(values.email, locale);
    if (emailError) {
        errors.email = emailError;
    }

    const passwordError = validatePassword(values.password, locale);
    if (passwordError) {
        errors.password = passwordError;
    }

    if (!values.confirmPassword) {
        errors.confirmPassword =
            locale === 'en' ? 'Confirm password' : 'Подтвердите пароль';
    } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword =
            locale === 'en' ? 'Passwords do not match' : 'Пароли не совпадают';
    }

    return errors;
};
