'use client';

import type { ProjectStatus } from '@/shared/api';
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
    imageUrl?: string | null;
    description: string;
    boardTabs: string[];
    status: ProjectStatus;
    memberCount: number;
    imageFile?: File | null;
    createdAt?: string;
    ownerId?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerAvatarUrl?: string | null;
    folderId?: string;
};

export type ProjectFolder = {
    id: string;
    name: string;
    createdAt?: string;
    ownerId?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerAvatarUrl?: string | null;
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
        status: 'ACTIVE',
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
        status: 'PLANNING',
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
        status: 'ACTIVE',
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
        status: 'ON_HOLD',
        memberCount: 4,
    },
];

type ActiveProjectContextValue = {
    projects: ProjectSummary[];
    setProjects: Dispatch<SetStateAction<ProjectSummary[]>>;
    createProject: (project: ProjectSummary) => Promise<void>;
    updateProject: (project: ProjectSummary) => Promise<void>;
    uploadProjectImage: (projectId: string, file: File) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    folders: ProjectFolder[];
    createFolder: (folder: ProjectFolder) => Promise<void>;
    updateFolder: (folder: ProjectFolder) => Promise<void>;
    deleteFolder: (folderId: string) => Promise<void>;
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
