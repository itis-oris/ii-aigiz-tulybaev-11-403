import { cn } from '@/shared/lib';
import {
    Avatar,
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/ui';
import type { ProjectParticipant } from '@/views/home/model/project-overview';

type OverviewMemberItemProps = {
    member: ProjectParticipant;
};

const OverviewMemberItem = ({ member }: OverviewMemberItemProps) => {
    return (
        <Card className="border border-border/60 py-0 ring-0">
            <CardHeader className="px-4 py-3">
                <div className="flex items-center gap-4">
                    <Avatar size="2xl" className={cn(member.accentClassName)}>
                        {member.initials}
                    </Avatar>
                    <div className="min-w-0">
                        <CardTitle className="text-sm font-medium">
                            {member.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                            {member.role}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};

export default OverviewMemberItem;
