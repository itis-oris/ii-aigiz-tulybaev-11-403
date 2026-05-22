import type { ProjectParticipant } from '@/views/home/model/project-overview';
import OverviewMemberItem from './overview-member-item';

type OverviewMembersListProps = {
    members: ProjectParticipant[];
    canManageRoles: boolean;
    updatingMemberId: string | null;
    removingMemberId: string | null;
    transferringOwnerMemberId: string | null;
    onRoleChange: (
        memberId: string,
        role: 'PROJECT_MANAGER' | 'PROJECT_MEMBER',
    ) => void;
    onTransferOwnership: (memberId: string) => void;
    onRemove: (memberId: string) => void;
};

const OverviewMembersList = ({
    members,
    canManageRoles,
    updatingMemberId,
    removingMemberId,
    transferringOwnerMemberId,
    onRoleChange,
    onTransferOwnership,
    onRemove,
}: OverviewMembersListProps) => {
    return (
        <div className="space-y-2">
            {members.map((member) => (
                <OverviewMemberItem
                    key={member.id}
                    member={member}
                    canManageRole={canManageRoles}
                    isUpdatingRole={updatingMemberId === member.id}
                    isRemoving={removingMemberId === member.id}
                    isTransferringOwnership={
                        transferringOwnerMemberId === member.id
                    }
                    onRoleChange={onRoleChange}
                    onTransferOwnership={onTransferOwnership}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

export default OverviewMembersList;
