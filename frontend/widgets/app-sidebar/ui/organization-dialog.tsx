'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import { useI18n } from '@/shared/lib';
import { Button, Input } from '@/shared/ui';

type OrganizationDialogProps = {
    open: boolean;
    mode: 'create' | 'edit';
    initialName?: string;
    pending?: boolean;
    error?: string | null;
    canDelete?: boolean;
    deletePending?: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (name: string) => Promise<void> | void;
    onDelete?: () => Promise<void> | void;
};

export function OrganizationDialog({
    open,
    mode,
    initialName = '',
    pending = false,
    error = null,
    canDelete = false,
    deletePending = false,
    onOpenChange,
    onSubmit,
    onDelete,
}: OrganizationDialogProps) {
    const { t } = useI18n();
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !pending && !deletePending) {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [deletePending, onOpenChange, open, pending]);

    if (!open) {
        return null;
    }

    const handleSubmit = async () => {
        await onSubmit(name.trim());
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-8 md:items-center"
            onClick={() => {
                if (!pending && !deletePending) {
                    onOpenChange(false);
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="organization-dialog-title"
                className="w-full max-w-[30rem] overflow-hidden rounded-[18px] border border-border bg-card text-card-foreground shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="organization-dialog-title"
                                className="text-2xl font-semibold text-foreground"
                            >
                                {mode === 'create'
                                    ? t('organization.createTitle')
                                    : t('organization.editTitle')}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {mode === 'create'
                                    ? t('organization.createDescription')
                                    : t('organization.editDescription')}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-1 rounded-lg text-muted-foreground"
                            onClick={() => onOpenChange(false)}
                            disabled={pending || deletePending}
                        >
                            <X className="size-4" />
                            <span className="sr-only">
                                {t('common.closeDialog')}
                            </span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 px-5 py-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="organization-name"
                            className="text-sm font-medium text-foreground"
                        >
                            {t('organization.nameLabel')}
                        </label>
                        <Input
                            id="organization-name"
                            uiSize="lg"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={t('organization.namePlaceholder')}
                            disabled={pending}
                            autoFocus
                        />
                    </div>

                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                    {mode === 'edit' && canDelete ? (
                        <Button
                            type="button"
                            variant="destructive"
                            size="xl"
                            className="rounded-xl px-6 sm:mr-auto"
                            onClick={() => void onDelete?.()}
                            disabled={pending || deletePending}
                        >
                            {deletePending ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : null}
                            <span>{t('organization.deleteAction')}</span>
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={() => onOpenChange(false)}
                        disabled={pending || deletePending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={handleSubmit}
                        disabled={
                            pending || deletePending || name.trim().length < 2
                        }
                    >
                        {pending ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : null}
                        <span>
                            {mode === 'create'
                                ? t('organization.createAction')
                                : t('organization.saveAction')}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
