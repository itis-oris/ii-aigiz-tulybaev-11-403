export type ProjectParticipant = {
    id: string;
    name: string;
    role: string;
    initials: string;
    accentClassName: string;
};

export type ProjectOverview = {
    name: string;
    status: string;
    statusToneClassName: string;
    description: string;
    emoji: string;
    members: ProjectParticipant[];
};

export const projectOverview: ProjectOverview = {
    name: 'Marlboro',
    status: 'В работе',
    statusToneClassName:
        'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20',
    description:
        'Проект ведет рекламные и продуктовые задачи по направлениям DIGITAL, TRADE и OUTDOOR. Команда координирует производство материалов, контент и запуск кампаний в едином рабочем контуре.',
    emoji: '💪',
    members: [
        {
            id: 'rashil',
            name: 'Расиль',
            role: 'Супер-админ',
            initials: 'Р',
            accentClassName:
                'bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/20',
        },
        {
            id: 'artem',
            name: 'Артем',
            role: 'Аккаунт-менеджер',
            initials: 'А',
            accentClassName:
                'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20',
        },
        {
            id: 'sofia',
            name: 'София',
            role: 'Дизайнер',
            initials: 'С',
            accentClassName:
                'bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/20',
        },
        {
            id: 'maksim',
            name: 'Максим',
            role: 'Motion designer',
            initials: 'М',
            accentClassName:
                'bg-lime-500/12 text-lime-700 ring-1 ring-lime-500/20',
        },
        {
            id: 'anna',
            name: 'Анна',
            role: 'Project manager',
            initials: 'А',
            accentClassName:
                'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20',
        },
    ],
};
