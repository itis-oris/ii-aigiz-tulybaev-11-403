import type { Locale } from '@/shared/lib/i18n';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRequired = (value: string, message: string) => {
    if (!value.trim()) {
        return message;
    }

    return undefined;
};

export const validateEmail = (value: string, locale: Locale = 'ru') => {
    if (!value.trim()) {
        return locale === 'en' ? 'Enter email' : 'Введите email';
    }

    if (!emailPattern.test(value.trim())) {
        return locale === 'en' ? 'Invalid email' : 'Некорректный email';
    }

    return undefined;
};

export const validatePassword = (value: string, locale: Locale = 'ru') => {
    if (!value) {
        return locale === 'en' ? 'Enter password' : 'Введите пароль';
    }

    if (value.length < 6) {
        return locale === 'en'
            ? 'Password must be at least 6 characters'
            : 'Пароль должен быть не короче 6 символов';
    }

    return undefined;
};
