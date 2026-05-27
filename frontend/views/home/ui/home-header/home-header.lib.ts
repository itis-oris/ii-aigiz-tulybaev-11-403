import type { ViewMode } from '@/views/home/ui/home-header/view-mode';

export const startOfWeek = (date: Date) => {
    const nextDate = new Date(date);
    const day = nextDate.getDay();
    const offset = day === 0 ? 6 : day - 1;
    nextDate.setDate(nextDate.getDate() - offset);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate;
};

export const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
};

export const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const getWeekRange = (selectedDate: Date, activeViewMode: ViewMode) =>
    activeViewMode === 'Неделя'
        ? Array.from({ length: 7 }, (_, index) =>
              addDays(startOfWeek(selectedDate), index),
          )
        : [];

export const getMonthRange = (selectedDate: Date, activeViewMode: ViewMode) =>
    activeViewMode === 'Месяц'
        ? Array.from(
              {
                  length: endOfMonth(selectedDate).getDate(),
              },
              (_, index) => addDays(startOfMonth(selectedDate), index),
          )
        : [];

export const getCalendarModifiers = (
    selectedDate: Date,
    activeViewMode: ViewMode,
) => {
    const weekRange = getWeekRange(selectedDate, activeViewMode);
    const monthRange = getMonthRange(selectedDate, activeViewMode);

    return {
        weekRange,
        weekRangeStart: weekRange[0] ? [weekRange[0]] : [],
        weekRangeEnd: weekRange[6] ? [weekRange[6]] : [],
        monthRange,
        monthRangeStart: monthRange[0] ? [monthRange[0]] : [],
        monthRangeEnd: monthRange.at(-1) ? [monthRange.at(-1)!] : [],
    };
};

export const getCalendarModifierClassNames = (activeViewMode: ViewMode) => ({
    weekRange:
        'bg-accent/35 text-accent-foreground [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground',
    weekRangeStart:
        'rounded-l-md bg-accent/55 text-accent-foreground [&>button]:rounded-l-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground',
    weekRangeEnd:
        'rounded-r-md bg-accent/55 text-accent-foreground [&>button]:rounded-r-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground',
    monthRange:
        activeViewMode === 'Месяц'
            ? 'bg-accent/35 text-accent-foreground [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground'
            : '',
    monthRangeStart:
        activeViewMode === 'Месяц'
            ? 'rounded-l-md bg-accent/55 text-accent-foreground [&>button]:rounded-l-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground'
            : '',
    monthRangeEnd:
        activeViewMode === 'Месяц'
            ? 'rounded-r-md bg-accent/55 text-accent-foreground [&>button]:rounded-r-md [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button:hover]:bg-transparent [&>button:hover]:text-accent-foreground'
            : '',
});

export const getActiveFiltersCount = (
    searchQuery: string,
    selectedStatus: string,
    selectedTag: string,
) =>
    [
        searchQuery.trim().length > 0,
        selectedStatus !== 'all',
        selectedTag !== 'all',
    ].filter(Boolean).length;
