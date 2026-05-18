import type { TaskStatus } from '@/shared/api';

export const formatCommentTime = (createdAt: string) =>
    new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(createdAt));

export const getPriorityLabel = (priority?: number) => {
    if (priority === undefined) {
        return 'Не указан';
    }

    if (priority <= 1) {
        return 'Высокий';
    }

    if (priority === 2) {
        return 'Средний';
    }

    return 'Низкий';
};

export const mapFrontendStatusToApiStatus = (status?: string): TaskStatus => {
    if (status === 'in progress') {
        return 'IN_PROGRESS';
    }

    if (status === 'done') {
        return 'DONE';
    }

    return 'TODO';
};

export const mapApiStatusToFrontendStatus = (status: TaskStatus) => {
    if (status === 'IN_PROGRESS') {
        return 'in progress';
    }

    if (status === 'DONE') {
        return 'done';
    }

    return 'todo';
};

export const getStoryPointsLabel = (storyPoints?: number) => {
    if (storyPoints === undefined) {
        return 'Без оценки';
    }

    return `${storyPoints} story points`;
};

export const getDisplayNameFromEmail = (email?: string) => {
    if (!email) {
        return 'Не назначен';
    }

    return email;
};

export const getDisplayNameFromUser = (user: {
    firstname?: string | null;
    lastname?: string | null;
    middlename?: string | null;
    email: string;
}) => {
    const fullName = [user.lastname, user.firstname, user.middlename]
        .filter(Boolean)
        .join(' ')
        .trim();

    return fullName || user.email;
};

export const getInitials = (value?: string) => {
    if (!value) {
        return 'NA';
    }

    const source = value.includes('@') ? value.split('@')[0] : value;
    const parts = source
        .split(/[._\-\s]+/)
        .filter(Boolean)
        .slice(0, 2);

    const initials = parts
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);

    return initials || source.slice(0, 2).toUpperCase() || 'NA';
};

export const renderAvatarContent = ({
    avatarUrl,
    fallback,
}: {
    avatarUrl?: string | null;
    fallback: string;
}) => {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={fallback}
                className="size-full rounded-full object-cover"
            />
        );
    }

    return fallback;
};

export const toDateTimeLocalValue = (value?: string) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toIsoDateTime = (value: string) => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const getDueInDaysLabel = (value?: string) => {
    if (!value) {
        return 'Без срока';
    }

    const dueDate = new Date(value);

    if (Number.isNaN(dueDate.getTime())) {
        return 'Без срока';
    }

    const diffInDays = Math.ceil(
        (dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
    );

    if (diffInDays < 0) {
        const overdueDays = Math.abs(diffInDays);
        return `Просрочено на ${overdueDays} дн.`;
    }

    if (diffInDays === 0) {
        return 'Сегодня';
    }

    if (diffInDays === 1) {
        return 'Завтра';
    }

    return `${diffInDays} дн.`;
};
