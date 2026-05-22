import { Crown, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import {
    Button,
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    ProjectAvatar,
} from '@/shared/ui';
import type { ProjectParticipant } from '@/views/home/model/project-overview';

type OverviewMemberItemProps = {
    member: ProjectParticipant;
    canManageRole: boolean;
    isRemoving: boolean;
    isTransferringOwnership: boolean;
    onTransferOwnership: (memberId: string) => void;
    onRemove: (memberId: string) => void;
};

const OverviewMemberItem = ({
    member,
    canManageRole,
    isRemoving,
    isTransferringOwnership,
    onTransferOwnership,
    onRemove,
}: OverviewMemberItemProps) => {
    return (
        <Card className="border border-border/60 py-0 ring-0">
            <CardHeader className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
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

                    {canManageRole && !member.isOwner ? (
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg px-3 text-xs"
                                disabled={isRemoving || isTransferringOwnership}
                                onClick={() => onTransferOwnership(member.id)}
                            >
                                <Crown className="size-3.5" />
                                Владелец
                            </Button>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="rounded-lg text-muted-foreground"
                                disabled={isRemoving || isTransferringOwnership}
                                onClick={() => onRemove(member.id)}
                            >
                                <Trash2 className="size-4" />
                                <span className="sr-only">
                                    Удалить участника
                                </span>
                            </Button>
                        </div>
                    ) : null}
                </div>
            </CardHeader>
        </Card>
    );
};

export default OverviewMemberItem;
