'use client';

import React, { useMemo, useState } from 'react';
import {
    organizationProjects,
    useActiveProject,
    useProjectTab,
} from '@/shared/lib';
import {
    organizationTaskDays,
    type DayTasks,
    type Task,
} from '@/views/home/model/task';
import { TaskSheet } from '@/views/home/ui/task-sheet';
import { Header } from '@/views/home/ui/home-header';
import { Board } from '@/views/home/ui/board';
import { Overview } from '@/views/home/ui/overview';

type HomePageProps = {
    scope?: 'project' | 'organization';
};

const HomePage = ({ scope = 'project' }: HomePageProps) => {
    const { activeProjectTab } = useProjectTab();
    const { activeProjectId } = useActiveProject();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const isOrganizationScope = scope === 'organization';
    const [organizationProjectFilter, setOrganizationProjectFilter] =
        useState<string>('all');
    const days = useMemo<DayTasks[]>(() => {
        if (isOrganizationScope) {
            if (organizationProjectFilter === 'all') {
                return organizationTaskDays;
            }

            return organizationTaskDays.map((day) => ({
                ...day,
                tasks: day.tasks.filter(
                    (task) => task.projectSlug === organizationProjectFilter,
                ),
            }));
        }

        return organizationTaskDays.map((day) => ({
            ...day,
            tasks: day.tasks.filter(
                (task) => task.projectSlug === activeProjectId,
            ),
        }));
    }, [activeProjectId, isOrganizationScope, organizationProjectFilter]);
    const totalTasks = useMemo(
        () => days.flatMap((day) => day.tasks).length,
        [days],
    );

    return (
        <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
            {!isOrganizationScope && activeProjectTab === 'Обзор' ? (
                <Overview />
            ) : (
                <>
                    <div className="shrink-0 border-b border-border bg-background px-3 py-2">
                        {isOrganizationScope ? (
                            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1 pt-1">
                                <div>
                                    <h1 className="text-xl font-semibold text-foreground">
                                        Все задачи
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Задачи из всех проектов организации в
                                        одном представлении.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                                    {totalTasks} задач
                                </div>
                            </div>
                        ) : null}
                        <Header
                            projectOptions={
                                isOrganizationScope
                                    ? organizationProjects
                                    : undefined
                            }
                            selectedProjectId={
                                isOrganizationScope
                                    ? organizationProjectFilter
                                    : undefined
                            }
                            onProjectChange={
                                isOrganizationScope
                                    ? setOrganizationProjectFilter
                                    : undefined
                            }
                        />
                    </div>
                    <Board
                        days={days}
                        setIsOpen={setIsOpen}
                        setSelectedTask={setSelectedTask}
                    />
                    <TaskSheet
                        isOpen={isOpen}
                        selectedTask={selectedTask}
                        setIsOpen={setIsOpen}
                        setSelectedTask={setSelectedTask}
                    />
                </>
            )}
        </div>
    );
};

export default HomePage;
