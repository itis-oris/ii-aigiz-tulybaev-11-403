'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { addProjectMembers, getProjectMembers, getUsers } from '@/shared/api';
import { cn, useActiveProject, useCurrentUser, useI18n } from '@/shared/lib';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    ProjectAvatar,
} from '@/shared/ui';
import {
    getParticipantAccentClassName,
    mapUserToWorkspaceMember,
    type ProjectParticipant,
} from '@/views/home/model/project-overview';
import AddProjectMemberDialog from './add-project-member-dialog';
import OverviewMembersList from './overview-members-list';

const Overview = () => {
    const { t } = useI18n();
    const { activeProjectId, projects } = useActiveProject();
    const { data: currentUser } = useCurrentUser();
    const queryClient = useQueryClient();
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const activeProject = useMemo(
        () => projects.find((project) => project.id === activeProjectId),
        [activeProjectId, projects],
    );
    const { data: users = [], isLoading: isUsersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        retry: false,
    });
    const {
        data: projectMembers = [],
        isLoading: isProjectMembersLoading,
        isError: isProjectMembersError,
    } = useQuery({
        queryKey: ['project-members', activeProjectId],
        queryFn: () => getProjectMembers(activeProjectId),
        enabled: Boolean(activeProjectId),
        retry: false,
    });
    const addProjectMembersMutation = useMutation({
        mutationFn: (userIds: string[]) =>
            addProjectMembers(activeProjectId, { userIds }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['project-members', activeProjectId],
            }),
    });

    const workspaceMembers = useMemo(
        () => users.map(mapUserToWorkspaceMember),
        [users],
    );

    const participants = useMemo<ProjectParticipant[]>(() => {
        const sortedMembers = [...projectMembers].sort((left, right) => {
            const leftIsOwner = activeProject?.ownerId === left.id;
            const rightIsOwner = activeProject?.ownerId === right.id;

            if (leftIsOwner === rightIsOwner) {
                return left.email.localeCompare(right.email, 'ru-RU');
            }

            return leftIsOwner ? -1 : 1;
        });

        return sortedMembers.map((member, index) => {
            const mappedMember = mapUserToWorkspaceMember(member, index);
            const isOwner = activeProject?.ownerId === member.id;

            return {
                ...mappedMember,
                role: isOwner ? 'Владелец проекта' : mappedMember.role,
                accentClassName: getParticipantAccentClassName(index),
            };
        });
    }, [activeProject?.ownerId, projectMembers]);

    if (!activeProject) {
        return null;
    }

    const ownerName =
        activeProject.ownerName || (activeProject.ownerEmail ?? 'Не назначен');
    const description = activeProject.description
        ? activeProject.description
        : [
              `Владелец: ${ownerName}.`,
              currentUser?.organizationName
                  ? `Организация: ${currentUser.organizationName}.`
                  : null,
          ]
              .filter(Boolean)
              .join(' ');

    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <Card className="bg-transparent py-0 ring-0">
                        <CardContent className="px-0 py-0">
                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
                                <ProjectAvatar
                                    size="2xl"
                                    shape="square"
                                    className={cn(
                                        'size-24 rounded-3xl bg-primary text-5xl text-primary-foreground shadow-sm ring-1 ring-border',
                                        activeProject.avatarClassName,
                                    )}
                                    imageUrl={activeProject.imageUrl}
                                    fallback={activeProject.avatar}
                                    alt={activeProject.name}
                                />
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-3xl font-semibold sm:text-4xl">
                                        {activeProject.name}
                                    </CardTitle>
                                    <CardDescription className="mt-4 text-sm leading-7">
                                        {description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('overview.members')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('overview.membersDescription')}
                            </p>
                        </div>
                        <Button
                            size="md"
                            onClick={() => setIsAddMemberDialogOpen(true)}
                            disabled={
                                isUsersLoading ||
                                addProjectMembersMutation.isPending
                            }
                        >
                            <Plus className="size-4" />
                            {t('overview.addMember')}
                        </Button>
                    </div>

                    {isProjectMembersError ? (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            Не удалось загрузить участников проекта.
                        </div>
                    ) : isProjectMembersLoading ? (
                        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                            Загрузка участников...
                        </div>
                    ) : (
                        <OverviewMembersList members={participants} />
                    )}
                </div>
            </section>

            <AddProjectMemberDialog
                open={isAddMemberDialogOpen}
                members={workspaceMembers}
                projectMemberIds={participants.map((member) => member.id)}
                onOpenChange={setIsAddMemberDialogOpen}
                onSubmit={async (nextMembers) => {
                    await addProjectMembersMutation.mutateAsync(
                        nextMembers.map((member) => member.id),
                    );
                }}
            />
        </div>
    );
};

export default Overview;
