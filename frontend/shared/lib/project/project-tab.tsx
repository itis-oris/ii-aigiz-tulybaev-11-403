'use client';

import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useContext,
} from 'react';

export const projectTabs = ['Обзор', 'Задачи'] as const;

export type ProjectTab = (typeof projectTabs)[number];

type ProjectTabContextValue = {
    activeProjectTab: ProjectTab;
    setActiveProjectTab: Dispatch<SetStateAction<ProjectTab>>;
};

const ProjectTabContext = createContext<ProjectTabContextValue | null>(null);

type ProjectTabProviderProps = {
    children: ReactNode;
    value: ProjectTabContextValue;
};

export const ProjectTabProvider = ({
    children,
    value,
}: ProjectTabProviderProps) => {
    return (
        <ProjectTabContext.Provider value={value}>
            {children}
        </ProjectTabContext.Provider>
    );
};

export const useProjectTab = () => {
    const context = useContext(ProjectTabContext);

    if (!context) {
        throw new Error('useProjectTab must be used within ProjectTabProvider');
    }

    return context;
};
