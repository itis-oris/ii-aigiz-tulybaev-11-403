'use client';

import { useCallback, useEffect, useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { Button, Input } from '@/shared/ui';

type CreateProjectFolderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (folderName: string) => void;
};

const CreateProjectFolderDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateProjectFolderDialogProps) => {
    const [name, setName] = useState('');

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setName('');
            }

            onOpenChange(nextOpen);
        },
        [onOpenChange],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleOpenChange, open]);

    const trimmedName = name.trim();

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 py-8 md:items-center"
            onClick={() => handleOpenChange(false)}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-project-folder-title"
                className="w-full max-w-[32rem] overflow-hidden rounded-[18px] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="create-project-folder-title"
                                className="text-[1.75rem] leading-8 font-semibold text-foreground"
                            >
                                Создать папку проектов
                            </h2>
                            <p className="mt-2 text-base leading-6 text-muted-foreground">
                                Папка поможет сгруппировать связанные проекты в
                                одном месте.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-1 rounded-lg text-muted-foreground hover:bg-slate-100"
                            onClick={() => handleOpenChange(false)}
                        >
                            <X className="size-4" />
                            <span className="sr-only">Закрыть окно</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-5 px-5 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="project-folder-name"
                            className="text-sm font-medium text-foreground"
                        >
                            Название папки
                        </label>
                        <Input
                            id="project-folder-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            uiSize="lg"
                            placeholder="Например, Клиентские проекты"
                        />
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="xl"
                        className="rounded-xl px-6"
                        onClick={() => handleOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        size="xl"
                        className="rounded-xl px-6"
                        disabled={!trimmedName}
                        onClick={() => {
                            onSubmit(trimmedName);
                            handleOpenChange(false);
                        }}
                    >
                        <FolderPlus className="size-4" />
                        Создать папку
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectFolderDialog;
