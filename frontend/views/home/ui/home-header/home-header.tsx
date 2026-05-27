import React, { useState } from 'react';
import {
    viewModes,
    type ViewMode,
} from '@/views/home/ui/home-header/view-mode';
import {
    sortModes,
    type SortMode,
} from '@/views/home/ui/home-header/sort-mode';
import HomeHeaderFilters from './home-header-filters';
import HomeHeaderPeriodControl from './home-header-period-control';
import HomeHeaderSettings from './home-header-settings';
import HomeHeaderSelect from './home-header-select';
import type { HomeHeaderProps } from './home-header.types';

const Header = ({
    activeViewMode: controlledViewMode,
    onViewModeChange,
    projectOptions = [],
    selectedProjectId,
    onProjectChange,
    activeSortMode = 'По умолчанию',
    onSortModeChange,
    searchQuery = '',
    onSearchQueryChange,
    selectedStatus = 'all',
    onSelectedStatusChange,
    selectedTag = 'all',
    onSelectedTagChange,
    statusOptions = [],
    tagOptions = [],
    onResetFilters,
    periodTitle,
    periodSubtitle,
    selectedDate,
    onSelectedDateChange,
    selectedRange,
    onSelectedRangeChange,
    onPreviousPeriod,
    onNextPeriod,
    onResetPeriod,
    settings,
    onSettingsChange,
}: HomeHeaderProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('Неделя');
    const activeViewMode = controlledViewMode ?? viewMode;

    const handleViewModeChange = (nextViewMode: ViewMode) => {
        onViewModeChange?.(nextViewMode);

        if (controlledViewMode === undefined) {
            setViewMode(nextViewMode);
        }
    };

    const projectOptionsWithAll = [
        { label: 'Все проекты', value: 'all' },
        ...projectOptions.map((project) => ({
            label: project.name,
            value: project.id,
        })),
    ];

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <HomeHeaderSelect
                    value={activeViewMode}
                    onChange={handleViewModeChange}
                    options={viewModes.map((mode) => ({
                        label: mode,
                        value: mode,
                    }))}
                />
                <HomeHeaderFilters
                    searchQuery={searchQuery}
                    onSearchQueryChange={onSearchQueryChange}
                    selectedStatus={selectedStatus}
                    onSelectedStatusChange={onSelectedStatusChange}
                    selectedTag={selectedTag}
                    onSelectedTagChange={onSelectedTagChange}
                    statusOptions={statusOptions}
                    tagOptions={tagOptions}
                    onResetFilters={onResetFilters}
                />
                {projectOptions.length > 0 ? (
                    <HomeHeaderSelect
                        value={selectedProjectId}
                        onChange={onProjectChange}
                        options={projectOptionsWithAll}
                    />
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <HomeHeaderSelect
                    value={activeSortMode}
                    onChange={(mode) => onSortModeChange?.(mode as SortMode)}
                    options={sortModes.map((mode) => ({
                        label: mode,
                        value: mode,
                    }))}
                />
                <HomeHeaderPeriodControl
                    activeViewMode={activeViewMode}
                    periodTitle={periodTitle}
                    periodSubtitle={periodSubtitle}
                    selectedDate={selectedDate}
                    onSelectedDateChange={onSelectedDateChange}
                    selectedRange={selectedRange}
                    onSelectedRangeChange={onSelectedRangeChange}
                    onPreviousPeriod={onPreviousPeriod}
                    onNextPeriod={onNextPeriod}
                    onResetPeriod={onResetPeriod}
                />
                {settings ? (
                    <HomeHeaderSettings
                        settings={settings}
                        onChange={onSettingsChange}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default Header;
