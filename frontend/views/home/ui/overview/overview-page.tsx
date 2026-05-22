'use client';

import { useI18n } from '@/shared/lib';
import OverviewMembersSection from './overview-members-section';
import OverviewProjectHero from './overview-project-hero';
import { useOverviewMembersController } from './use-overview-members-controller';

const Overview = () => {
    const { t } = useI18n();
    const {
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
        isAddingMembers,
        updatingMemberId,
        removingMemberId,
        transferringOwnerMemberId,
        roleUpdateError,
        memberRemovalError,
        ownershipTransferError,
        handleRoleChange,
        handleTransferOwnership,
        handleRemoveMember,
        addMembers,
    } = useOverviewMembersController();

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
                    <OverviewProjectHero
                        project={activeProject}
                        description={description}
                    />

                    <OverviewMembersSection
                        title={t('overview.members')}
                        description={t('overview.membersDescription')}
                        addMemberLabel={t('overview.addMember')}
                        canManageMembers={canManageMembers}
                        isUsersLoading={isUsersLoading}
                        isProjectMembersLoading={isProjectMembersLoading}
                        isProjectMembersError={isProjectMembersError}
                        isAddingMembers={isAddingMembers}
                        updatingMemberId={updatingMemberId}
                        removingMemberId={removingMemberId}
                        transferringOwnerMemberId={transferringOwnerMemberId}
                        roleUpdateError={roleUpdateError}
                        memberRemovalError={memberRemovalError}
                        ownershipTransferError={ownershipTransferError}
                        participants={participants}
                        workspaceMembers={workspaceMembers}
                        isAddMemberDialogOpen={isAddMemberDialogOpen}
                        onOpenAddMemberDialog={() =>
                            setIsAddMemberDialogOpen(true)
                        }
                        onOpenChangeAddMemberDialog={setIsAddMemberDialogOpen}
                        onRoleChange={handleRoleChange}
                        onTransferOwnership={handleTransferOwnership}
                        onRemoveMember={handleRemoveMember}
                        onAddMembers={addMembers}
                    />
                </div>
            </section>
        </div>
    );
};

export default Overview;
