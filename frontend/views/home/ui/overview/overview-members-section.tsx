import AddProjectMemberDialog from './add-project-member-dialog';
import OverviewMembersFeedback from './overview-members-feedback';
import OverviewMembersHeader from './overview-members-header';
import OverviewMembersList from './overview-members-list';
import type {
    ProjectParticipant,
    WorkspaceMember,
} from '@/views/home/model/project-overview';

type OverviewMembersSectionProps = {
    title: string;
    description: string;
    addMemberLabel: string;
    canManageMembers: boolean;
    isUsersLoading: boolean;
    isProjectMembersLoading: boolean;
    isProjectMembersError: boolean;
    isAddingMembers: boolean;
    removingMemberId: string | null;
    transferringOwnerMemberId: string | null;
    memberRemovalError: string | null;
    ownershipTransferError: string | null;
    participants: ProjectParticipant[];
    workspaceMembers: WorkspaceMember[];
    isAddMemberDialogOpen: boolean;
    onOpenAddMemberDialog: () => void;
    onOpenChangeAddMemberDialog: (open: boolean) => void;
    onTransferOwnership: (memberId: string) => void;
    onRemoveMember: (memberId: string) => void;
    onAddMembers: (memberIds: string[]) => Promise<void>;
};

const OverviewMembersSection = ({
    title,
    description,
    addMemberLabel,
    canManageMembers,
    isUsersLoading,
    isProjectMembersLoading,
    isProjectMembersError,
    isAddingMembers,
    removingMemberId,
    transferringOwnerMemberId,
    memberRemovalError,
    ownershipTransferError,
    participants,
    workspaceMembers,
    isAddMemberDialogOpen,
    onOpenAddMemberDialog,
    onOpenChangeAddMemberDialog,
    onTransferOwnership,
    onRemoveMember,
    onAddMembers,
}: OverviewMembersSectionProps) => {
    return (
        <>
            <OverviewMembersHeader
                title={title}
                description={description}
                addMemberLabel={addMemberLabel}
                canManageMembers={canManageMembers}
                isUsersLoading={isUsersLoading}
                isAddingMembers={isAddingMembers}
                onAddMember={onOpenAddMemberDialog}
            />

            <OverviewMembersFeedback
                isProjectMembersError={isProjectMembersError}
                isProjectMembersLoading={isProjectMembersLoading}
                memberRemovalError={memberRemovalError}
                ownershipTransferError={ownershipTransferError}
            />

            {!isProjectMembersError && !isProjectMembersLoading ? (
                <div className="space-y-3">
                    <OverviewMembersList
                        members={participants}
                        canManageRoles={canManageMembers}
                        removingMemberId={removingMemberId}
                        transferringOwnerMemberId={transferringOwnerMemberId}
                        onTransferOwnership={onTransferOwnership}
                        onRemove={onRemoveMember}
                    />
                </div>
            ) : null}

            <AddProjectMemberDialog
                open={isAddMemberDialogOpen}
                members={workspaceMembers}
                projectMemberIds={participants.map((member) => member.id)}
                onOpenChange={onOpenChangeAddMemberDialog}
                onSubmit={async (nextMembers) => {
                    await onAddMembers(nextMembers.map((member) => member.id));
                }}
            />
        </>
    );
};

export default OverviewMembersSection;
