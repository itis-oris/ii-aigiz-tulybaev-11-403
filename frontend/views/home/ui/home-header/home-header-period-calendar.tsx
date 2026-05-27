import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import {
    Button,
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui';
import {
    getCalendarModifierClassNames,
    getCalendarModifiers,
} from './home-header.lib';
import type { HomeHeaderPeriodControlProps } from './home-header.types';

type HomeHeaderPeriodCalendarProps = Pick<
    HomeHeaderPeriodControlProps,
    | 'activeViewMode'
    | 'selectedDate'
    | 'onSelectedDateChange'
    | 'selectedRange'
    | 'onSelectedRangeChange'
    | 'onResetPeriod'
>;

const HomeHeaderPeriodCalendar = ({
    activeViewMode,
    selectedDate,
    onSelectedDateChange,
    selectedRange,
    onSelectedRangeChange,
    onResetPeriod,
}: HomeHeaderPeriodCalendarProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDateSelect = (date: Date | undefined) => {
        onSelectedDateChange?.(date);
        setIsOpen(false);
    };

    const handleRangeSelect = (
        range: HomeHeaderPeriodControlProps['selectedRange'],
    ) => {
        onSelectedRangeChange?.(range);

        if (range?.from && range.to) {
            setIsOpen(false);
        }
    };

    const handleReset = () => {
        onResetPeriod?.();
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 rounded-md text-muted-foreground"
                    aria-label="Выбрать дату"
                >
                    <CalendarDays className="size-3.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-auto p-0">
                {activeViewMode === 'Доски' ? (
                    <Calendar
                        mode="range"
                        selected={selectedRange}
                        onSelect={handleRangeSelect}
                        defaultMonth={selectedRange?.from ?? selectedDate}
                        numberOfMonths={2}
                    />
                ) : (
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        defaultMonth={selectedDate}
                        modifiers={getCalendarModifiers(
                            selectedDate,
                            activeViewMode,
                        )}
                        modifiersClassNames={getCalendarModifierClassNames(
                            activeViewMode,
                        )}
                    />
                )}
                <div className="border-t border-border p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-muted-foreground"
                        onClick={handleReset}
                    >
                        Сбросить к текущему набору
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default HomeHeaderPeriodCalendar;
