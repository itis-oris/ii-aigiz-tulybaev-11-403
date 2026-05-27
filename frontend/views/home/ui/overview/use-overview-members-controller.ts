'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    addProjectMembers,
    ApiError,
    getProjectMembers,
    getUsers,
    removeProjectMember,
    updateProject,
} from '@/shared/api';
import {
    hasOrgAdminRole,
    PROJECT_OWNER_ROLE,
    useActiveProject,
    useCurrentUser,
} from '@/shared/lib';
import {
    getParticipantAccentClassName,
    mapUserToWorkspaceMember,
    type ProjectParticipant,
} from '@/views/home/model/project-overview';

export const useOverviewMembersController = () => {
    const { activeProjectId, projects } = useActiveProject();
    const { data: currentUser } = useCurrentUser();
    const queryClient = useQueryClient();
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [memberRemovalError, setMemberRemovalError] = useState<string | null>(
        null,
    );
    const [ownershipTransferError, setOwnershipTransferError] = useState<
        string | null
    >(null);

    const activeProject = useMemo(
        () => projects.find((project) => project.id === activeProjectId),
        [activeProjectId, projects],
    );

    const canManageMembers = useMemo(() => {
        if (hasOrgAdminRole(currentUser?.roles)) {
            return true;
        }

        return activeProject?.currentUserAccessLevel === PROJECT_OWNER_ROLE;
    }, [activeProject?.currentUserAccessLevel, currentUser?.roles]);

    const { data: users = [], isLoading: isUsersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        enabled: canManageMembers,
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

    const invalidateProjectQueries = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ['project-members', activeProjectId],
        });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
    }, [activeProjectId, queryClient]);

    const addProjectMembersMutation = useMutation({
        mutationFn: (userIds: string[]) => {
            if (!activeProjectId) {
                throw new Error('Project is not selected');
            }

            return addProjectMembers(activeProjectId, { userIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['project-members', activeProjectId],
            });
        },
    });

    const removeProjectMemberMutation = useMutation({
        mutationFn: (userId: string) => {
            if (!activeProjectId) {
                throw new Error('Project is not selected');
            }

            return removeProjectMember(activeProjectId, userId);
        },
        onSuccess: () => {
            setMemberRemovalError(null);
            invalidateProjectQueries();
        },
        onError: (error) => {
            setMemberRemovalError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось удалить участника проекта',
            );
        },
    });

    const transferProjectOwnershipMutation = useMutation({
        mutationFn: (ownerId: string) => {
            if (!activeProjectId || !activeProject) {
                throw new Error('Project is not selected');
            }

            return updateProject(activeProjectId, {
                name: activeProject.name,
                description: activeProject.description,
                status: activeProject.status,
                ownerId,
                folderId: activeProject.folderId,
            });
        },
        onSuccess: () => {
            setOwnershipTransferError(null);
            invalidateProjectQueries();
        },
        onError: (error) => {
            setOwnershipTransferError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось передать владение проектом',
            );
        },
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
                roleCode: isOwner ? PROJECT_OWNER_ROLE : mappedMember.roleCode,
                accentClassName: getParticipantAccentClassName(index),
                isOwner,
            };
        });
    }, [activeProject?.ownerId, projectMembers]);

    const handleTransferOwnership = useCallback(
        (memberId: string) => {
            const member = participants.find(
                (participant) => participant.id === memberId,
            );

            if (
                !member ||
                member.isOwner ||
                !window.confirm(`Сделать ${member.name} владельцем проекта?`)
            ) {
                return;
            }

            setOwnershipTransferError(null);
            transferProjectOwnershipMutation.mutate(memberId);
        },
        [participants, transferProjectOwnershipMutation],
    );

    const handleRemoveMember = useCallback(
        (memberId: string) => {
            const member = participants.find(
                (participant) => participant.id === memberId,
            );

            if (
                !member ||
                member.isOwner ||
                !window.confirm(`Удалить ${member.name} из проекта?`)
            ) {
                return;
            }

            setMemberRemovalError(null);
            removeProjectMemberMutation.mutate(memberId);
        },
        [participants, removeProjectMemberMutation],
    );

    return {
        activeProject,
        currentUser,
        isAddMemberDialogOpen,
        setIsAddMemberDialogOpen,
        canManageMembers,
        workspaceMembers,
        participants,
        isUsersLoading,
        isProjectMembersLoading,
        isProjectMembersError,
        isAddingMembers: addProjectMembersMutation.isPending,
        removingMemberId: removeProjectMemberMutation.isPending
            ? (removeProjectMemberMutation.variables ?? null)
            : null,
        transferringOwnerMemberId: transferProjectOwnershipMutation.isPending
            ? (transferProjectOwnershipMutation.variables ?? null)
            : null,
        memberRemovalError,
        ownershipTransferError,
        handleTransferOwnership,
        handleRemoveMember,
        addMembers: async (memberIds: string[]) => {
            await addProjectMembersMutation.mutateAsync(memberIds);
        },
    };
};
