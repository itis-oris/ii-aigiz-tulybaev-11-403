import { cn } from '@/shared/lib';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    ProjectAvatar,
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
                    <ProjectAvatar
                        size="2xl"
                        shape="full"
                        className={cn(member.accentClassName)}
                        imageUrl={member.avatarUrl}
                        fallback={member.initials}
                        alt={member.name}
                    />
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
