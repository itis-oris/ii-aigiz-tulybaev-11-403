type OverviewMembersFeedbackProps = {
    isProjectMembersError: boolean;
    isProjectMembersLoading: boolean;
    memberRemovalError: string | null;
    ownershipTransferError: string | null;
};

const errorClassName =
    'rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive';

const OverviewMembersFeedback = ({
    isProjectMembersError,
    isProjectMembersLoading,
    memberRemovalError,
    ownershipTransferError,
}: OverviewMembersFeedbackProps) => {
    if (isProjectMembersError) {
        return (
            <div className={errorClassName}>
                Не удалось загрузить участников проекта.
            </div>
        );
    }

    if (isProjectMembersLoading) {
        return (
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                Загрузка участников...
            </div>
        );
    }

    return (
        <>
            {memberRemovalError ? (
                <div className={errorClassName}>{memberRemovalError}</div>
            ) : null}
            {ownershipTransferError ? (
                <div className={errorClassName}>{ownershipTransferError}</div>
            ) : null}
        </>
    );
};

export default OverviewMembersFeedback;
