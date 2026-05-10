'use client';

import { useState } from 'react';
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
import { Button, Input } from '@/shared/ui';
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
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
        useState(false);
    const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
        useState(false);
    const { groupedFolders, hasResults, normalizedQuery, rootProjects } =
        useAllProjectsWorkspace({
            folders,
            projects,
            query,
        });
    const { draggedProjectId, handleDragEnd, handleDragStart } =
        useProjectFolderDndController({
            moveProjectToFolder,
            parseProjectId: parseAllProjectsProjectId,
            parseFolderId: parseAllProjectsFolderId,
        });

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
                                        Ничего не найдено по текущему запросу.
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
