import { FunnelPlus } from 'lucide-react';
import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui';
import { getActiveFiltersCount } from './home-header.lib';
import HomeHeaderSelect from './home-header-select';
import type { HomeHeaderFiltersProps } from './home-header.types';

const HomeHeaderFilters = ({
    searchQuery,
    onSearchQueryChange,
    selectedStatus,
    onSelectedStatusChange,
    selectedTag,
    onSelectedTagChange,
    statusOptions,
    tagOptions,
    onResetFilters,
}: HomeHeaderFiltersProps) => {
    const activeFiltersCount = getActiveFiltersCount(
        searchQuery,
        selectedStatus,
        selectedTag,
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <FunnelPlus className="size-4" />
                    Добавить фильтр
                    {activeFiltersCount > 0 ? (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                            {activeFiltersCount}
                        </span>
                    ) : null}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-3">
                <div className="space-y-3">
                    <div>
                        <div className="text-sm font-medium text-foreground">
                            Фильтры
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            Уточните список задач по названию, статусу и тегу.
                        </div>
                    </div>
                    <Input
                        value={searchQuery}
                        onChange={(event) =>
                            onSearchQueryChange?.(event.target.value)
                        }
                        placeholder="Поиск по названию"
                        uiSize="md"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <HomeHeaderSelect
                            value={selectedStatus}
                            onChange={onSelectedStatusChange}
                            options={[
                                { label: 'Все статусы', value: 'all' },
                                ...statusOptions.map((status) => ({
                                    label: status,
                                    value: status,
                                })),
                            ]}
                        />
                        <HomeHeaderSelect
                            value={selectedTag}
                            onChange={onSelectedTagChange}
                            options={[
                                { label: 'Все теги', value: 'all' },
                                ...tagOptions.map((tag) => ({
                                    label: tag,
                                    value: tag,
                                })),
                            ]}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-muted-foreground"
                        onClick={onResetFilters}
                    >
                        Сбросить фильтры
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default HomeHeaderFilters;
