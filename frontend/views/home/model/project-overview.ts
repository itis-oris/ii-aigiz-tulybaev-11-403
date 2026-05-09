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
    name: 'Lorem Ipsum',
    status: 'Active',
    statusToneClassName:
        'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20',
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    emoji: 'LI',
    members: [
        {
            id: 'member-1',
            name: 'Lorem One',
            role: 'Owner',
            initials: 'LO',
            accentClassName:
                'bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/20',
        },
        {
            id: 'member-2',
            name: 'Ipsum Two',
            role: 'Manager',
            initials: 'IT',
            accentClassName:
                'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20',
        },
        {
            id: 'member-3',
            name: 'Dolor Three',
            role: 'Designer',
            initials: 'DT',
            accentClassName:
                'bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/20',
        },
        {
            id: 'member-4',
            name: 'Sit Four',
            role: 'Developer',
            initials: 'SF',
            accentClassName:
                'bg-lime-500/12 text-lime-700 ring-1 ring-lime-500/20',
        },
        {
            id: 'member-5',
            name: 'Amet Five',
            role: 'Reviewer',
            initials: 'AF',
            accentClassName:
                'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20',
        },
    ],
};
