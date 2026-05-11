'use client';

import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useContext,
} from 'react';

export type ProjectSummary = {
    id: string;
    name: string;
    shortLabel: string;
    avatar: string;
    avatarClassName: string;
    description: string;
    boardTabs: string[];
    lifecycleStatus: 'active' | 'at_risk' | 'on_hold' | 'completed';
    memberCount: number;
    folderId?: string;
};

export type ProjectFolder = {
    id: string;
    name: string;
    shortLabel: string;
    avatarClassName: string;
    description: string;
    ownerName: string;
    ownerInitials: string;
    ownerClassName: string;
    dateLabel: string;
};

export const organizationProjects: ProjectSummary[] = [
    {
        id: 'project-a',
        name: 'Project A',
        shortLabel: 'PA',
        avatar: 'PA',
        avatarClassName: 'bg-amber-100 text-amber-700',
        description: 'Основной продуктовый контур и текущая delivery-команда.',
        boardTabs: ['DIGITAL', 'TRADE', 'OUTDOOR'],
        lifecycleStatus: 'active',
        memberCount: 7,
    },
    {
        id: 'project-b',
        name: 'Project B',
        shortLabel: 'PB',
        avatar: 'PB',
        avatarClassName: 'bg-sky-100 text-sky-700',
        description: 'Операционный проект с фокусом на запуск и сопровождение.',
        boardTabs: ['CORE', 'OPS', 'QA'],
        lifecycleStatus: 'at_risk',
        memberCount: 5,
    },
    {
        id: 'project-c',
        name: 'Project C',
        shortLabel: 'PC',
        avatar: 'PC',
        avatarClassName: 'bg-emerald-100 text-emerald-700',
        description: 'Growth-направление с задачами маркетинга и активации.',
        boardTabs: ['ACQ', 'RETENTION', 'CRM'],
        lifecycleStatus: 'active',
        memberCount: 6,
    },
    {
        id: 'project-d',
        name: 'Project D',
        shortLabel: 'PD',
        avatar: 'PD',
        avatarClassName: 'bg-violet-100 text-violet-700',
        description: 'Экспериментальный поток для новых продуктовых гипотез.',
        boardTabs: ['LAB', 'MVP', 'RESEARCH'],
        lifecycleStatus: 'on_hold',
        memberCount: 4,
    },
];

type ActiveProjectContextValue = {
    projects: ProjectSummary[];
    setProjects: Dispatch<SetStateAction<ProjectSummary[]>>;
    folders: ProjectFolder[];
    setFolders: Dispatch<SetStateAction<ProjectFolder[]>>;
    collapsedFolderIds: string[];
    setCollapsedFolderIds: Dispatch<SetStateAction<string[]>>;
    activeProjectId: string;
    setActiveProjectId: Dispatch<SetStateAction<string>>;
    activeBoardId: string;
    setActiveBoardId: Dispatch<SetStateAction<string>>;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(
    null,
);

type ActiveProjectProviderProps = {
    children: ReactNode;
    value: ActiveProjectContextValue;
};

export const ActiveProjectProvider = ({
    children,
    value,
}: ActiveProjectProviderProps) => {
    return (
        <ActiveProjectContext.Provider value={value}>
            {children}
        </ActiveProjectContext.Provider>
    );
};

export const useActiveProject = () => {
    const context = useContext(ActiveProjectContext);

    if (!context) {
        throw new Error(
            'useActiveProject must be used within ActiveProjectProvider',
        );
    }

    return context;
};
