import type { ProjectParticipant } from '@/views/home/model/project-overview';
import OverviewMemberItem from './OverviewMemberItem';

type OverviewMembersListProps = {
    members: ProjectParticipant[];
};

const OverviewMembersList = ({ members }: OverviewMembersListProps) => {
    return (
        <div className="space-y-2">
            {members.map((member) => (
                <OverviewMemberItem key={member.id} member={member} />
            ))}
        </div>
    );
};

export default OverviewMembersList;
