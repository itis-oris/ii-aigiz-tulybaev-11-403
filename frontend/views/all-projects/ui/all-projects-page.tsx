'use client';

import { useMemo, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import {
    FolderPlus,
    PlusCircle,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import {
    useProjectFolderDndController,
    useWorkspaceProjectsController,
} from '@/shared/lib';
import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui';
import CreateProjectDialog from '@/widgets/app-sidebar/ui/create-project-dialog';
import { useAllProjectsWorkspace } from '@/views/all-projects/model/use-all-projects-workspace';
import {
    parseAllProjectsFolderId,
    parseAllProjectsProjectId,
} from './all-projects-dnd';
import { FolderRow } from './folder-row';
import { ProjectRow } from './project-row';
import { RootDropZone } from './root-drop-zone';
import CreateProjectFolderDialog from './create-project-folder-dialog';

const placementOptions = [
    { label: 'Все проекты', value: 'all' },
    { label: 'В папках', value: 'foldered' },
    { label: 'Без папки', value: 'root' },
] as const;

const AllProjectsPage = () => {
    const {
        activeProjectId,
        collapsedFolderIds,
        createFolder,
        createProject,
        folders,
        moveProjectToFolder,
        projects,
        selectProject,
        toggleFolder,
    } = useWorkspaceProjectsController();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'В работе' | 'Планирование'
    >('all');
    const [placementFilter, setPlacementFilter] = useState<
        'all' | 'foldered' | 'root'
    >('all');
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
        useState(false);
    const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
        useState(false);
    const {
        groupedFolders,
        hasResults,
        normalizedQuery,
        rootProjects,
        statusOptions,
    } = useAllProjectsWorkspace({
        folders,
        projects,
        query,
        statusFilter,
        placementFilter,
    });
    const { draggedProjectId, handleDragEnd, handleDragStart } =
        useProjectFolderDndController({
            moveProjectToFolder,
            parseProjectId: parseAllProjectsProjectId,
            parseFolderId: parseAllProjectsFolderId,
        });
    const activeFiltersCount = useMemo(
        () =>
            [
                query.trim().length > 0,
                statusFilter !== 'all',
                placementFilter !== 'all',
            ].filter(Boolean).length,
        [placementFilter, query, statusFilter],
    );

    const handleResetFilters = () => {
        setQuery('');
        setStatusFilter('all');
        setPlacementFilter('all');
    };

    return (
        <>
            <DragDropProvider
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="min-h-0 flex-1 overflow-y-auto bg-background">
                    <section className="w-full px-1 py-2">
                        <div className="overflow-hidden rounded-xl bg-card">
                            <div className="border-b border-border px-3 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                                        <div className="relative min-w-[220px] max-w-sm flex-1">
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
                                            aria-label="Сбросить поиск и фильтры"
                                            onClick={handleResetFilters}
                                            disabled={activeFiltersCount === 0}
                                        >
                                            <SlidersHorizontal className="size-4" />
                                        </Button>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="md"
                                                    className="text-muted-foreground"
                                                >
                                                    <PlusCircle className="size-4" />
                                                    Добавить фильтр
                                                    {activeFiltersCount > 0 ? (
                                                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                                                            {activeFiltersCount}
                                                        </span>
                                                    ) : null}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                align="start"
                                                className="w-80 p-3"
                                            >
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-foreground">
                                                            Фильтры проектов
                                                        </div>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            Фильтруйте список по
                                                            статусу и размещению
                                                            проекта.
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-medium text-foreground">
                                                                Статус
                                                            </div>
                                                            <select
                                                                value={
                                                                    statusFilter
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setStatusFilter(
                                                                        event
                                                                            .target
                                                                            .value as typeof statusFilter,
                                                                    )
                                                                }
                                                                className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-ring"
                                                            >
                                                                <option value="all">
                                                                    Все статусы
                                                                </option>
                                                                {statusOptions.map(
                                                                    (
                                                                        status,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                status
                                                                            }
                                                                            value={
                                                                                status
                                                                            }
                                                                        >
                                                                            {
                                                                                status
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-medium text-foreground">
                                                                Размещение
                                                            </div>
                                                            <select
                                                                value={
                                                                    placementFilter
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setPlacementFilter(
                                                                        event
                                                                            .target
                                                                            .value as typeof placementFilter,
                                                                    )
                                                                }
                                                                className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-ring"
                                                            >
                                                                {placementOptions.map(
                                                                    (
                                                                        option,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-center text-muted-foreground"
                                                        onClick={
                                                            handleResetFilters
                                                        }
                                                    >
                                                        Сбросить фильтры
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            size="md"
                                            onClick={() =>
                                                setIsCreateProjectDialogOpen(
                                                    true,
                                                )
                                            }
                                        >
                                            Добавить проект
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            onClick={() =>
                                                setIsCreateFolderDialogOpen(
                                                    true,
                                                )
                                            }
                                        >
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

                                {draggedProjectId ? (
                                    <div className="border-b border-border px-3 py-2 text-sm text-muted-foreground">
                                        Перетащите проект в папку или в корневую
                                        область, чтобы убрать его из папки.
                                    </div>
                                ) : null}

                                {groupedFolders.map(({ folder, projects }) => (
                                    <div
                                        key={folder.id}
                                        className="mx-3 my-3 rounded-xl bg-amber-50/30 p-2"
                                    >
                                        <FolderRow
                                            folder={folder}
                                            childrenCount={projects.length}
                                            isCollapsed={collapsedFolderIds.includes(
                                                folder.id,
                                            )}
                                            onToggle={() =>
                                                toggleFolder(folder.id)
                                            }
                                        />
                                        {!collapsedFolderIds.includes(
                                            folder.id,
                                        ) ? (
                                            <div className="mt-2 overflow-hidden rounded-lg bg-background/90">
                                                {projects.length ? (
                                                    projects.map((project) => (
                                                        <ProjectRow
                                                            key={project.id}
                                                            project={project}
                                                            activeProjectId={
                                                                activeProjectId
                                                            }
                                                            setActiveProjectId={
                                                                selectProject
                                                            }
                                                            className="bg-background"
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-4 text-sm text-muted-foreground">
                                                        Внутри папки пока нет
                                                        проектов.
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                                <div className="mx-3 my-3">
                                    <div className="mb-2 px-1 text-xs font-medium text-muted-foreground">
                                        Без папки
                                    </div>
                                    <RootDropZone>
                                        {rootProjects.length ? (
                                            rootProjects.map((project) => (
                                                <ProjectRow
                                                    key={project.id}
                                                    project={project}
                                                    activeProjectId={
                                                        activeProjectId
                                                    }
                                                    setActiveProjectId={
                                                        selectProject
                                                    }
                                                />
                                            ))
                                        ) : (
                                            <div className="px-3 py-6 text-sm text-muted-foreground">
                                                Перетащите сюда проект, чтобы
                                                убрать его из папки.
                                            </div>
                                        )}
                                    </RootDropZone>
                                </div>

                                {!hasResults ? (
                                    <div className="px-3 py-10 text-sm text-muted-foreground">
                                        {normalizedQuery ||
                                        activeFiltersCount > 0
                                            ? 'Ничего не найдено по текущему запросу и фильтрам.'
                                            : 'Проекты не найдены.'}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>
                </div>
            </DragDropProvider>

            <CreateProjectDialog
                open={isCreateProjectDialogOpen}
                onOpenChange={setIsCreateProjectDialogOpen}
                projectCount={projects.length}
                folders={folders}
                onSubmit={createProject}
            />

            <CreateProjectFolderDialog
                open={isCreateFolderDialogOpen}
                onOpenChange={setIsCreateFolderDialogOpen}
                onSubmit={createFolder}
            />
        </>
    );
};

export default AllProjectsPage;
