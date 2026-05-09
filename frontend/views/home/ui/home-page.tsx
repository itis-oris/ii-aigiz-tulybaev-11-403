'use client';

import React, { useState } from 'react';
import { useProjectTab } from '@/shared/lib';
import type { Task } from '@/views/home/model/task';
import { TaskSheet } from '@/views/home/ui/task-sheet';
import { Header } from '@/views/home/ui/home-header';
import { Board } from '@/views/home/ui/board';
import { Overview } from '@/views/home/ui/overview';

const HomePage = () => {
    const { activeProjectTab } = useProjectTab();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    return (
        <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
            {activeProjectTab === 'Обзор' ? (
                <Overview />
            ) : (
                <>
                    <div className="shrink-0 border-b border-border bg-background px-3 py-2">
                        <Header />
                    </div>
                    <Board
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
