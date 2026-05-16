'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link2, PlusCircle, X } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { cn, useI18n } from '@/shared/lib';

type InviteWorkspaceDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type InviteRow = {
    id: number;
    email: string;
};

export function InviteWorkspaceDialog({
    open,
    onOpenChange,
}: InviteWorkspaceDialogProps) {
    const { t } = useI18n();
    const [inviteByLink, setInviteByLink] = useState(false);
    const [rows, setRows] = useState<InviteRow[]>([{ id: 1, email: '' }]);

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

    const canSubmit = useMemo(
        () => rows.some((row) => row.email.trim().length > 0) || inviteByLink,
        [inviteByLink, rows],
    );

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
                                {t('dialogs.inviteWorkspaceDescription')}
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
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                                {t('dialogs.inviteLink')}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={inviteByLink}
                                onClick={() =>
                                    setInviteByLink((current) => !current)
                                }
                                className={cn(
                                    'relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors',
                                    inviteByLink ? 'bg-primary' : 'bg-muted',
                                )}
                            >
                                <span
                                    className={cn(
                                        'absolute top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform',
                                        inviteByLink
                                            ? 'translate-x-[1.15rem]'
                                            : 'translate-x-0.5',
                                    )}
                                />
                                <span className="sr-only">
                                    {t('dialogs.toggleInviteLink')}
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={
                                        inviteByLink
                                            ? 'https://sprintly.app/invite/campus-team'
                                            : ''
                                    }
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
                                disabled={!inviteByLink}
                                className="min-w-[8.5rem] rounded-xl"
                            >
                                {t('dialogs.copy')}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {rows.map((row) => (
                            <div
                                key={row.id}
                                className="flex flex-col gap-2 sm:flex-row sm:items-center"
                            >
                                <Input
                                    value={row.email}
                                    onChange={(event) =>
                                        setRows((currentRows) =>
                                            currentRows.map((currentRow) =>
                                                currentRow.id === row.id
                                                    ? {
                                                          ...currentRow,
                                                          email: event.target
                                                              .value,
                                                      }
                                                    : currentRow,
                                            ),
                                        )
                                    }
                                    uiSize="lg"
                                    placeholder={t('dialogs.emailPlaceholder')}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="self-end rounded-lg text-muted-foreground sm:self-auto"
                                    onClick={() =>
                                        setRows((currentRows) =>
                                            currentRows.length === 1
                                                ? currentRows.map(
                                                      (currentRow) =>
                                                          currentRow.id ===
                                                          row.id
                                                              ? {
                                                                    ...currentRow,
                                                                    email: '',
                                                                }
                                                              : currentRow,
                                                  )
                                                : currentRows.filter(
                                                      (currentRow) =>
                                                          currentRow.id !==
                                                          row.id,
                                                  ),
                                        )
                                    }
                                >
                                    <X className="size-4" />
                                    <span className="sr-only">
                                        {t('dialogs.removeInviteRow')}
                                    </span>
                                </Button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setRows((currentRows) => [
                                    ...currentRows,
                                    {
                                        id:
                                            Math.max(
                                                0,
                                                ...currentRows.map(
                                                    (row) => row.id,
                                                ),
                                            ) + 1,
                                        email: '',
                                    },
                                ])
                            }
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <PlusCircle className="size-4" />
                            {t('dialogs.addMore')}
                        </button>
                    </div>
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
                    >
                        {t('dialogs.invitePeople')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
