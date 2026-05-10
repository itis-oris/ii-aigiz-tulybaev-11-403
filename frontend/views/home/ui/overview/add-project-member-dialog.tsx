'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Avatar, Button, Input } from '@/shared/ui';
import type {
    ProjectParticipant,
    WorkspaceMember,
} from '@/views/home/model/project-overview';

type AddProjectMemberDialogProps = {
    open: boolean;
    members: WorkspaceMember[];
    projectMemberIds: string[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (members: ProjectParticipant[]) => void;
};

const toProjectParticipant = ({
    id,
    name,
    role,
    initials,
    accentClassName,
}: WorkspaceMember): ProjectParticipant => ({
    id,
    name,
    role,
    initials,
    accentClassName,
});

const AddProjectMemberDialog = ({
    open,
    members,
    projectMemberIds,
    onOpenChange,
    onSubmit,
}: AddProjectMemberDialogProps) => {
    const [query, setQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setQuery('');
                setSelectedIds([]);
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

    const availableMembers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return members.filter((member) => {
            if (projectMemberIds.includes(member.id)) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return (
                member.name.toLowerCase().includes(normalizedQuery) ||
                member.email.toLowerCase().includes(normalizedQuery) ||
                member.role.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [members, projectMemberIds, query]);

    const selectedMembers = useMemo(
        () =>
            members
                .filter((member) => selectedIds.includes(member.id))
                .map(toProjectParticipant),
        [members, selectedIds],
    );

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
                aria-labelledby="add-project-member-title"
                className="w-full max-w-[38rem] overflow-hidden rounded-[18px] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-border px-5 pb-4 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2
                                id="add-project-member-title"
                                className="text-[1.75rem] leading-8 font-semibold text-foreground"
                            >
                                Добавить участника в проект
                            </h2>
                            <p className="mt-2 text-base leading-6 text-muted-foreground">
                                Выберите людей из рабочего пространства, которым
                                нужен доступ к этому проекту.
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
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            uiSize="lg"
                            placeholder="Поиск по имени, роли или почте"
                            className="pl-9"
                        />
                    </div>

                    <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                        {availableMembers.length ? (
                            availableMembers.map((member) => {
                                const isSelected = selectedIds.includes(
                                    member.id,
                                );

                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedIds((current) =>
                                                current.includes(member.id)
                                                    ? current.filter(
                                                          (id) =>
                                                              id !== member.id,
                                                      )
                                                    : [...current, member.id],
                                            )
                                        }
                                        className={cn(
                                            'flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors',
                                            isSelected
                                                ? 'border-primary/40 bg-primary/5'
                                                : 'border-border/70 bg-background hover:bg-slate-50',
                                        )}
                                    >
                                        <Avatar
                                            size="2xl"
                                            className={cn(
                                                member.accentClassName,
                                            )}
                                        >
                                            {member.initials}
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-foreground">
                                                {member.name}
                                            </div>
                                            <div className="mt-1 truncate text-sm text-muted-foreground">
                                                {member.role}
                                            </div>
                                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {member.email}
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                                isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-white text-transparent',
                                            )}
                                        >
                                            <Check className="size-3.5" />
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                                Подходящих участников не найдено или все уже
                                добавлены в проект.
                            </div>
                        )}
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
                        disabled={!selectedMembers.length}
                        onClick={() => {
                            onSubmit(selectedMembers);
                            handleOpenChange(false);
                        }}
                    >
                        Добавить участников
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectMemberDialog;
