const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRequired = (value: string, message: string) => {
    if (!value.trim()) {
        return message;
    }

    return undefined;
};

export const validateEmail = (value: string) => {
    if (!value.trim()) {
        return 'Введите email';
    }

    if (!emailPattern.test(value.trim())) {
        return 'Некорректный email';
    }

    return undefined;
};

export const validatePassword = (value: string) => {
    if (!value) {
        return 'Введите пароль';
    }

    if (value.length < 6) {
        return 'Пароль должен быть не короче 6 символов';
    }

    return undefined;
};
