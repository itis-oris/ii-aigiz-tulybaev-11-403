'use client';

import { cn } from '@/shared/lib';
import type { MyTasksFilter } from '@/views/my-tasks/model';

type MyTasksFilterTabsProps = {
    filters: MyTasksFilter[];
    activeFilter: MyTasksFilter;
    onFilterChange?: (filter: MyTasksFilter) => void;
};

const MyTasksFilterTabs = ({
    filters,
    activeFilter,
    onFilterChange,
}: MyTasksFilterTabsProps) => {
    return (
        <div className="inline-flex items-center rounded-xl bg-muted/70 p-1">
            {filters.map((filter) => (
                <button
                    key={filter}
                    type="button"
                    onClick={() => onFilterChange?.(filter)}
                    className={cn(
                        'rounded-lg px-4 py-2 text-sm transition-colors',
                        activeFilter === filter
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-foreground/80 hover:text-foreground',
                    )}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};

export default MyTasksFilterTabs;
export type { MyTasksFilterTabsProps };
