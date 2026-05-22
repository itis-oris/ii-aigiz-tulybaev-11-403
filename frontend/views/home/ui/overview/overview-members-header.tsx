import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui';

type OverviewMembersHeaderProps = {
    title: string;
    description: string;
    addMemberLabel: string;
    canManageMembers: boolean;
    isUsersLoading: boolean;
    isAddingMembers: boolean;
    onAddMember: () => void;
};

const OverviewMembersHeader = ({
    title,
    description,
    addMemberLabel,
    canManageMembers,
    isUsersLoading,
    isAddingMembers,
    onAddMember,
}: OverviewMembersHeaderProps) => {
    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                <h2 className="text-2xl font-semibold text-foreground">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <Button
                size="md"
                onClick={onAddMember}
                disabled={
                    !canManageMembers || isUsersLoading || isAddingMembers
                }
            >
                <Plus className="size-4" />
                {addMemberLabel}
            </Button>
        </div>
    );
};

export default OverviewMembersHeader;
