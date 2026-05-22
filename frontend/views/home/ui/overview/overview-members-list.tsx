import type { ProjectParticipant } from '@/views/home/model/project-overview';
import OverviewMemberItem from './overview-member-item';

type OverviewMembersListProps = {
    members: ProjectParticipant[];
    canManageRoles: boolean;
    removingMemberId: string | null;
    transferringOwnerMemberId: string | null;
    onTransferOwnership: (memberId: string) => void;
    onRemove: (memberId: string) => void;
};

const OverviewMembersList = ({
    members,
    canManageRoles,
    removingMemberId,
    transferringOwnerMemberId,
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
                    isRemoving={removingMemberId === member.id}
                    isTransferringOwnership={
                        transferringOwnerMemberId === member.id
                    }
                    onTransferOwnership={onTransferOwnership}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

export default OverviewMembersList;
