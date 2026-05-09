'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
    FolderPlus,
    PlusCircle,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import {
    cn,
    organizationProjects,
    useActiveProject,
    type ProjectSummary,
} from '@/shared/lib';
import { Avatar, Button, Input } from '@/shared/ui';

type ProjectListItem = ProjectSummary & {
    ownerName: string;
    ownerInitials: string;
    ownerClassName: string;
    status: 'В работе' | 'Планирование';
    dateLabel: string;
};

const projects: ProjectListItem[] = [
    {
        ...organizationProjects[0],
        ownerName: 'Расиль',
        ownerInitials: 'Р',
        ownerClassName: 'bg-slate-100 text-slate-600',
        status: 'В работе',
        dateLabel: '-',
    },
    {
        ...organizationProjects[1],
        ownerName: 'София',
        ownerInitials: 'С',
        ownerClassName: 'bg-sky-100 text-sky-700',
        status: 'В работе',
        dateLabel: '12 мая',
    },
    {
        ...organizationProjects[2],
        ownerName: 'Анна',
        ownerInitials: 'А',
        ownerClassName: 'bg-emerald-100 text-emerald-700',
        status: 'Планирование',
        dateLabel: '18 мая',
    },
    {
        ...organizationProjects[3],
        ownerName: 'Илья',
        ownerInitials: 'И',
        ownerClassName: 'bg-violet-100 text-violet-700',
        status: 'В работе',
        dateLabel: '24 мая',
    },
];

const AllProjectsPage = () => {
    const { activeProjectId, setActiveProjectId } = useActiveProject();
    const [query, setQuery] = useState('');

    const filteredProjects = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return projects;
        }

        return projects.filter((project) =>
            project.name.toLowerCase().includes(normalizedQuery),
        );
    }, [query]);

    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="w-full px-1 py-2">
                <div className="overflow-hidden rounded-xl bg-card">
                    <div className="border-b border-border px-3 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                                <div className="relative min-w-[220px] flex-1 max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        uiSize="md"
                                        placeholder="Поиск"
                                        className="pl-9"
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    size="md"
                                    className="text-muted-foreground"
                                >
                                    <SlidersHorizontal className="size-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="md"
                                    className="text-muted-foreground"
                                >
                                    <PlusCircle className="size-4" />
                                    Добавить фильтр
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="md">Добавить проект</Button>
                                <Button variant="outline" size="md">
                                    <FolderPlus className="size-4" />
                                    Добавить папку
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="grid grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-4 border-b border-border px-3 py-3 text-sm text-foreground">
                            <div>Наименование</div>
                            <div>Статус</div>
                            <div>Дата</div>
                            <div>Владелец</div>
                        </div>

                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="grid grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-4 border-b border-border px-3 py-2 transition-colors hover:bg-muted/30"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar
                                        size="md"
                                        shape="square"
                                        className={project.avatarClassName}
                                    >
                                        {project.avatar}
                                    </Avatar>
                                    <Link
                                        href="/"
                                        onClick={() =>
                                            setActiveProjectId(project.id)
                                        }
                                        className={cn(
                                            'truncate text-sm text-foreground transition-colors hover:text-primary',
                                            activeProjectId === project.id &&
                                                'font-medium',
                                        )}
                                    >
                                        {project.name}
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <span
                                        className={cn(
                                            'size-2 rounded-full',
                                            project.status === 'В работе'
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-400',
                                        )}
                                    />
                                    <span>{project.status}</span>
                                </div>

                                <div className="flex items-center text-sm text-muted-foreground">
                                    {project.dateLabel}
                                </div>

                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar
                                        size="sm"
                                        className={project.ownerClassName}
                                    >
                                        {project.ownerInitials}
                                    </Avatar>
                                    <span className="truncate text-sm text-muted-foreground">
                                        {project.ownerName}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {filteredProjects.length === 0 ? (
                            <div className="px-3 py-10 text-sm text-muted-foreground">
                                Ничего не найдено по текущему запросу.
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AllProjectsPage;
