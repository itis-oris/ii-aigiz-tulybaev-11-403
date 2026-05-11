import type { DateRange } from 'react-day-picker';
import type { ProjectSummary } from '@/shared/lib';
import type { SortMode } from '@/views/home/ui/home-header/sort-mode';
import type { ViewMode } from '@/views/home/ui/home-header/view-mode';

export type HomeHeaderSelectOption<T extends string = string> = {
    label: string;
    value: T;
};

export type HomeHeaderProps = {
    activeViewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
    projectOptions?: ProjectSummary[];
    selectedProjectId?: string;
    onProjectChange?: (projectId: string) => void;
    activeSortMode?: SortMode;
    onSortModeChange?: (mode: SortMode) => void;
    searchQuery?: string;
    onSearchQueryChange?: (value: string) => void;
    selectedStatus?: string;
    onSelectedStatusChange?: (value: string) => void;
    selectedTag?: string;
    onSelectedTagChange?: (value: string) => void;
    statusOptions?: string[];
    tagOptions?: string[];
    onResetFilters?: () => void;
    periodTitle: string;
    periodSubtitle: string;
    selectedDate: Date;
    onSelectedDateChange?: (date: Date | undefined) => void;
    selectedRange?: DateRange;
    onSelectedRangeChange?: (range: DateRange | undefined) => void;
    onPreviousPeriod?: () => void;
    onNextPeriod?: () => void;
    onResetPeriod?: () => void;
};

export type HomeHeaderFiltersProps = {
    searchQuery: string;
    onSearchQueryChange?: (value: string) => void;
    selectedStatus: string;
    onSelectedStatusChange?: (value: string) => void;
    selectedTag: string;
    onSelectedTagChange?: (value: string) => void;
    statusOptions: string[];
    tagOptions: string[];
    onResetFilters?: () => void;
};

export type HomeHeaderPeriodControlProps = {
    activeViewMode: ViewMode;
    periodTitle: string;
    periodSubtitle: string;
    selectedDate: Date;
    onSelectedDateChange?: (date: Date | undefined) => void;
    selectedRange?: DateRange;
    onSelectedRangeChange?: (range: DateRange | undefined) => void;
    onPreviousPeriod?: () => void;
    onNextPeriod?: () => void;
    onResetPeriod?: () => void;
};
