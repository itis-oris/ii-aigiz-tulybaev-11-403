'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link2, X } from 'lucide-react';
import { ApiError, createOrganizationInvitations } from '@/shared/api';
import { Button, Input } from '@/shared/ui';
import { cn, useCurrentUser, useI18n } from '@/shared/lib';

type InviteWorkspaceDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function InviteWorkspaceDialog({
    open,
    onOpenChange,
}: InviteWorkspaceDialogProps) {
    const { t } = useI18n();
    const { data: currentUser } = useCurrentUser();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [inviteLink, setInviteLink] = useState('');

    const createInvitationsMutation = useMutation({
        mutationFn: ({
            organizationId,
            emails,
        }: {
            organizationId: string;
            emails: string[];
        }) =>
            createOrganizationInvitations(organizationId, {
                emails,
                createLinkInvitation: true,
            }),
        onSuccess: (data) => {
            const linkInvitation = data.find((invitation) => !invitation.email);
            if (linkInvitation && typeof window !== 'undefined') {
                setInviteLink(
                    `${window.location.origin}/invite/${linkInvitation.token}`,
                );
            }
            setSubmitError(null);
        },
        onError: (error) => {
            setSubmitError(
                error instanceof ApiError
                    ? error.message
                    : 'Не удалось создать приглашения',
            );
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onOpenChange, open]);

    const canSubmit = useMemo(() => true, []);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-8 md:items-center"
            onClick={() => onOpenChange(false)}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="invite-workspace-title"
                className="w-full max-w-[35rem] overflow-hidden rounded-[18px] border border-border bg-card text-card-foreground shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="invite-workspace-title"
                                className="text-[1.75rem] leading-8 font-semibold text-foreground"
                            >
                                {t('dialogs.inviteWorkspaceTitle')}
                            </h2>
                            <p className="mt-2 text-base leading-6 text-muted-foreground">
                                Подготовьте ссылку и отправьте её своим
                                коллегам, чтобы пригласить их в рабочее
                                пространство.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-1 rounded-lg text-muted-foreground"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="size-4" />
                            <span className="sr-only">
                                {t('common.closeDialog')}
                            </span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-5 px-5 py-8">
                    <div className="space-y-3">
                        <span className="text-sm font-medium text-foreground">
                            {t('dialogs.inviteLink')}
                        </span>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    uiSize="lg"
                                    placeholder={t('dialogs.linkPending')}
                                    className="pr-10 text-sm text-muted-foreground"
                                />
                                <Link2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="xl"
                                disabled={!inviteLink}
                                className="min-w-[8.5rem] rounded-xl"
                                onClick={async () => {
                                    if (!inviteLink) {
                                        return;
                                    }

                                    await navigator.clipboard.writeText(
                                        inviteLink,
                                    );
                                }}
                            >
                                {t('dialogs.copy')}
                            </Button>
                        </div>
                    </div>

                    {submitError ? (
                        <p className="text-sm text-destructive">
                            {submitError}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        disabled={!canSubmit}
                        className="rounded-xl px-6"
                        onClick={async () => {
                            if (!currentUser?.organizationId) {
                                setSubmitError('Нет активной организации');
                                return;
                            }

                            await createInvitationsMutation.mutateAsync({
                                organizationId: currentUser.organizationId,
                                emails: [],
                            });
                        }}
                    >
                        {t('dialogs.invitePeople')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
