'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { buttonVariants } from '@/shared/ui/button';

type CalendarMode = 'single' | 'range';

type DateRange = {
    from?: Date;
    to?: Date;
};

type CalendarProps = {
    className?: string;
    defaultMonth?: Date;
    mode?: CalendarMode;
    modifiers?: Record<string, Date[]>;
    modifiersClassNames?: Record<string, string>;
    numberOfMonths?: number;
    onSelect?:
        | ((date: Date | undefined) => void)
        | ((range: DateRange | undefined) => void);
    selected?: Date | DateRange;
    showOutsideDays?: boolean;
};

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
});

const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

const getMonthStart = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, months: number) =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);

const getCalendarStart = (month: Date) => {
    const monthStart = getMonthStart(month);
    const day = monthStart.getDay();
    const offset = day === 0 ? 6 : day - 1;
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - offset);

    return calendarStart;
};

const getMonthDays = (month: Date) =>
    Array.from({ length: 42 }, (_, index) => {
        const currentDate = getCalendarStart(month);
        currentDate.setDate(currentDate.getDate() + index);

        return currentDate;
    });

const isDateInList = (date: Date, dates: Date[] | undefined) =>
    dates?.some((value) => isSameDay(date, value)) ?? false;

const isDateInRange = (date: Date, range: DateRange | undefined) => {
    if (!range?.from) {
        return false;
    }

    const fromTime = new Date(
        range.from.getFullYear(),
        range.from.getMonth(),
        range.from.getDate(),
    ).getTime();
    const toDate = range.to ?? range.from;
    const toTime = new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        toDate.getDate(),
    ).getTime();
    const currentTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    ).getTime();

    return currentTime >= fromTime && currentTime <= toTime;
};

function Calendar({
    className,
    showOutsideDays = true,
    defaultMonth,
    mode = 'single',
    modifiers,
    modifiersClassNames,
    numberOfMonths = 1,
    onSelect,
    selected,
    ...props
}: CalendarProps) {
    const initialMonth = React.useMemo(
        () =>
            getMonthStart(
                defaultMonth ??
                    (selected instanceof Date ? selected : selected?.from) ??
                    new Date(),
            ),
        [defaultMonth, selected],
    );
    const [visibleMonth, setVisibleMonth] = React.useState(initialMonth);

    React.useEffect(() => {
        setVisibleMonth(initialMonth);
    }, [initialMonth]);

    const selectedRange =
        mode === 'range' && selected && !(selected instanceof Date)
            ? selected
            : undefined;
    const selectedDate =
        mode === 'single' && selected instanceof Date ? selected : undefined;

    const handleDateClick = (date: Date) => {
        if (mode === 'range') {
            const currentRange = selectedRange;

            if (!currentRange?.from || currentRange.to) {
                (
                    onSelect as
                        | ((range: DateRange | undefined) => void)
                        | undefined
                )?.({
                    from: date,
                    to: undefined,
                });
                return;
            }

            if (date.getTime() < currentRange.from.getTime()) {
                (
                    onSelect as
                        | ((range: DateRange | undefined) => void)
                        | undefined
                )?.({
                    from: date,
                    to: currentRange.from,
                });
                return;
            }

            (
                onSelect as ((range: DateRange | undefined) => void) | undefined
            )?.({
                from: currentRange.from,
                to: date,
            });
            return;
        }

        (onSelect as ((date: Date | undefined) => void) | undefined)?.(date);
    };

    return (
        <div className={cn('p-3', className)} {...props}>
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    className={cn(
                        buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                        'rounded-md text-muted-foreground',
                    )}
                    onClick={() =>
                        setVisibleMonth((current) => addMonths(current, -1))
                    }
                    aria-label="Предыдущий месяц"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    type="button"
                    className={cn(
                        buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                        'rounded-md text-muted-foreground',
                    )}
                    onClick={() =>
                        setVisibleMonth((current) => addMonths(current, 1))
                    }
                    aria-label="Следующий месяц"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
            <div
                className={cn(
                    'flex flex-col gap-4',
                    numberOfMonths > 1 && 'sm:flex-row',
                )}
            >
                {Array.from({ length: numberOfMonths }, (_, monthIndex) => {
                    const month = addMonths(visibleMonth, monthIndex);
                    const monthDays = getMonthDays(month);

                    return (
                        <div
                            key={`${month.getFullYear()}-${month.getMonth()}`}
                            className="flex flex-col gap-4"
                        >
                            <div className="text-center text-sm font-medium capitalize">
                                {monthFormatter.format(month)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {weekDays.map((weekDay) => (
                                    <div
                                        key={`${monthIndex}-${weekDay}`}
                                        className="flex h-9 items-center justify-center text-[0.8rem] text-muted-foreground"
                                    >
                                        {weekDay}
                                    </div>
                                ))}
                                {monthDays.map((date) => {
                                    const isOutside =
                                        date.getMonth() !== month.getMonth();
                                    const isSelected =
                                        selectedDate !== undefined &&
                                        isSameDay(selectedDate, date);
                                    const isRangeStart =
                                        selectedRange?.from !== undefined &&
                                        isSameDay(selectedRange.from, date);
                                    const isRangeEnd =
                                        selectedRange?.to !== undefined &&
                                        isSameDay(selectedRange.to, date);
                                    const isRangeMiddle =
                                        !isRangeStart &&
                                        !isRangeEnd &&
                                        isDateInRange(date, selectedRange);
                                    const isToday = isSameDay(date, new Date());
                                    const modifierClassName = Object.entries(
                                        modifiersClassNames ?? {},
                                    )
                                        .filter(([modifierName]) =>
                                            isDateInList(
                                                date,
                                                modifiers?.[modifierName],
                                            ),
                                        )
                                        .map(([, value]) => value)
                                        .join(' ');

                                    return (
                                        <div
                                            key={date.toISOString()}
                                            className={cn(
                                                'flex h-9 w-9 items-center justify-center rounded-md text-sm',
                                                isRangeMiddle &&
                                                    'bg-accent/40 text-accent-foreground rounded-none',
                                                isRangeStart &&
                                                    'rounded-l-md bg-primary text-primary-foreground',
                                                isRangeEnd &&
                                                    'rounded-r-md bg-primary text-primary-foreground',
                                                isToday &&
                                                    !isSelected &&
                                                    !isRangeStart &&
                                                    !isRangeEnd &&
                                                    'bg-accent text-accent-foreground',
                                                modifierClassName,
                                            )}
                                        >
                                            <button
                                                type="button"
                                                className={cn(
                                                    buttonVariants({
                                                        variant: 'ghost',
                                                        size: 'icon-sm',
                                                    }),
                                                    'size-9 rounded-md p-0 font-normal',
                                                    isSelected &&
                                                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                                    isOutside &&
                                                        'text-muted-foreground opacity-50',
                                                    !showOutsideDays &&
                                                        isOutside &&
                                                        'invisible',
                                                )}
                                                onClick={() =>
                                                    handleDateClick(date)
                                                }
                                            >
                                                {date.getDate()}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export { Calendar };
export type { CalendarProps, DateRange };
