import type { MyTasksFilter, TaskGroup } from './types';

export const myTasksFilters: MyTasksFilter[] = [
    'Назначенные мне',
    'Порученные мной',
];

export const myTasksGroups: TaskGroup[] = [
    {
        id: 'today',
        title: 'Сегодня',
        expanded: true,
        showCreate: true,
        rows: [
            {
                id: 'today-1',
                title: 'Сделать прототип - макет',
                number: '#24',
                filters: ['Назначенные мне'],
                assignees: [
                    {
                        name: 'Flay',
                        initials: 'FL',
                        className: 'bg-emerald-100 text-emerald-700',
                    },
                ],
                project: 'Develop',
                board: 'main',
                boardMark: 'M',
                column: 'In progress',
                columnMark: 'IP',
                date: '9 мая',
                tags: [
                    {
                        id: 'frontend',
                        label: 'frontend',
                        color: '#C026D3',
                    },
                    {
                        id: 'design',
                        label: 'дизайн',
                        color: '#0284C7',
                    },
                ],
            },
        ],
    },
    {
        id: 'tomorrow',
        title: 'Завтра',
        expanded: false,
        rows: [],
    },
    {
        id: 'yesterday',
        title: 'Вчера',
        expanded: false,
        rows: [],
    },
    {
        id: 'other',
        title: 'Другие задачи',
        expanded: true,
        showCreate: true,
        rows: [
            {
                id: 'other-1',
                title: 'Выбрать ui-kit',
                number: '#26',
                filters: ['Назначенные мне', 'Порученные мной'],
                assignees: [
                    {
                        name: 'Артем',
                        initials: 'A',
                        className: 'bg-slate-100 text-slate-600',
                    },
                    {
                        name: 'Flay',
                        initials: 'FL',
                        className: 'bg-emerald-100 text-emerald-700',
                    },
                    {
                        name: 'Тимур',
                        initials: 'T',
                        className: 'bg-slate-100 text-slate-600',
                    },
                ],
                project: 'Develop',
                board: 'main',
                boardMark: 'M',
                column: 'Backlog',
                columnMark: 'B',
                tags: [
                    {
                        id: 'frontend',
                        label: 'frontend',
                        color: '#C026D3',
                    },
                    {
                        id: 'design',
                        label: 'дизайн',
                        color: '#0284C7',
                    },
                ],
            },
            {
                id: 'other-2',
                title: 'Сделать схему',
                number: '#23',
                filters: ['Порученные мной'],
                assignees: [
                    {
                        name: 'Flay',
                        initials: 'FL',
                        className: 'bg-emerald-100 text-emerald-700',
                    },
                ],
                project: 'Develop',
                board: 'main',
                boardMark: 'M',
                column: 'Done',
                columnMark: 'D',
                completed: true,
                tags: [
                    {
                        id: 'frontend',
                        label: 'frontend',
                        color: '#C026D3',
                    },
                    {
                        id: 'management',
                        label: 'management',
                        color: '#D97706',
                    },
                ],
            },
            {
                id: 'other-3',
                title: 'Анализ конкурентов',
                number: '#17',
                filters: ['Порученные мной'],
                assignees: [
                    {
                        name: 'Pavel',
                        initials: 'P',
                        className: 'bg-slate-100 text-slate-600',
                    },
                    {
                        name: 'Anna',
                        initials: 'A',
                        className: 'bg-slate-100 text-slate-600',
                    },
                    {
                        name: 'Flay',
                        initials: 'FL',
                        className: 'bg-emerald-100 text-emerald-700',
                    },
                ],
                project: 'Develop',
                board: 'main',
                boardMark: 'M',
                column: 'Done',
                columnMark: 'D',
                completed: true,
                tags: [
                    {
                        id: 'management',
                        label: 'management',
                        color: '#D97706',
                    },
                ],
            },
            {
                id: 'other-4',
                title: 'Выбрать стек для фронта',
                number: '#11',
                filters: ['Назначенные мне'],
                assignees: [
                    {
                        name: 'Артем',
                        initials: 'A',
                        className: 'bg-slate-100 text-slate-600',
                    },
                    {
                        name: 'Flay',
                        initials: 'FL',
                        className: 'bg-emerald-100 text-emerald-700',
                    },
                ],
                project: 'Develop',
                board: 'main',
                boardMark: 'M',
                column: 'Done',
                columnMark: 'D',
                date: '20 февраля',
                completed: true,
                tags: [
                    {
                        id: 'frontend',
                        label: 'frontend',
                        color: '#C026D3',
                    },
                    {
                        id: 'management',
                        label: 'management',
                        color: '#D97706',
                    },
                ],
            },
        ],
    },
];
