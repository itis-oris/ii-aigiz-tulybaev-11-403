import { useState } from 'react';
import { LoaderCircle, Plus } from 'lucide-react';
import { Badge, Button } from '@/shared/ui';
import { Input } from '@/shared/ui/input';
import { getTagBadgeStyle } from '@/shared/lib/tag-color/index';
import type { TagResponse } from '@/shared/api/tag';
import type { Task } from '@/views/home/model/task';
import type { TaskSheetTagOption } from './task-sheet.types';

export const TaskSheetTagsSection = ({
    resolvedTask,
    selectedTagIds,
    availableTags,
    isTagsRefreshing,
    isSavingTags,
    isCreatingTag,
    onToggleTag,
    onSelectTagIds,
    onCreateTag,
}: {
    resolvedTask: Task;
    selectedTagIds: string[];
    availableTags: TaskSheetTagOption[];
    isTagsRefreshing: boolean;
    isSavingTags: boolean;
    isCreatingTag: boolean;
    onToggleTag: (tagId: string) => void;
    onSelectTagIds: (tagIds: string[]) => void;
    onCreateTag: (payload: {
        name: string;
        color: string;
    }) => Promise<TagResponse>;
}) => {
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#6366F1');

    const handleCreateTag = async () => {
        const normalizedName = newTagName.trim();

        if (!normalizedName) {
            return;
        }

        try {
            const createdTag = await onCreateTag({
                name: normalizedName,
                color: newTagColor,
            });
            const nextTagIds = selectedTagIds.includes(createdTag.id)
                ? selectedTagIds
                : [...selectedTagIds, createdTag.id];

            onSelectTagIds(nextTagIds);
            setNewTagName('');
        } catch {
            return;
        }
    };

    return (
        <div className="pt-2">
            <div className="mb-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Теги
            </div>
            {isTagsRefreshing ? (
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Обновление тегов
                </div>
            ) : null}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Input
                    value={newTagName}
                    onChange={(event) => setNewTagName(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleCreateTag();
                        }
                    }}
                    placeholder="Новый тег"
                    uiSize="md"
                    className="max-w-xs"
                />
                <input
                    type="color"
                    value={newTagColor}
                    onChange={(event) => setNewTagColor(event.target.value)}
                    className="h-9 w-11 cursor-pointer rounded-md border border-input bg-transparent p-1"
                    aria-label="Цвет нового тега"
                />
                <Button
                    type="button"
                    variant="outline"
                    disabled={!newTagName.trim() || isCreatingTag}
                    onClick={() => void handleCreateTag()}
                >
                    {isCreatingTag ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <Plus className="size-4" />
                    )}
                    Добавить тег
                </Button>
            </div>
            {availableTags.length ? (
                <div className="mb-4 flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                        const isSelected = selectedTagIds.includes(tag.id);

                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => onToggleTag(tag.id)}
                                className="cursor-pointer"
                                disabled={isSavingTags}
                            >
                                <Badge
                                    variant="outline"
                                    size="sm"
                                    style={getTagBadgeStyle(tag.color)}
                                    className={
                                        isSelected
                                            ? 'ring-2 ring-offset-1'
                                            : 'opacity-75'
                                    }
                                >
                                    {tag.name}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
                {resolvedTask.tags.map((tag) => (
                    <Badge
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        style={getTagBadgeStyle(tag.color)}
                    >
                        {tag.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
};
