import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui';
import HomeHeaderPeriodCalendar from './home-header-period-calendar';
import type { HomeHeaderPeriodControlProps } from './home-header.types';

const HomeHeaderPeriodControl = ({
    activeViewMode,
    periodTitle,
    periodSubtitle,
    selectedDate,
    onSelectedDateChange,
    selectedRange,
    onSelectedRangeChange,
    onPreviousPeriod,
    onNextPeriod,
    onResetPeriod,
}: HomeHeaderPeriodControlProps) => {
    return (
        <div className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-1.5">
            <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 rounded-md text-muted-foreground"
                aria-label="Предыдущая дата"
                onClick={onPreviousPeriod}
            >
                <ChevronLeft className="size-4" />
            </Button>
            <HomeHeaderPeriodCalendar
                activeViewMode={activeViewMode}
                selectedDate={selectedDate}
                onSelectedDateChange={onSelectedDateChange}
                selectedRange={selectedRange}
                onSelectedRangeChange={onSelectedRangeChange}
                onResetPeriod={onResetPeriod}
            />
            <div className="min-w-22 px-1.5 text-center">
                <div className="text-xs font-medium leading-none">
                    {periodTitle}
                </div>
                <div className="mt-0.5 text-[9px] leading-none text-muted-foreground">
                    {periodSubtitle}
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 rounded-md text-muted-foreground"
                aria-label="Следующая дата"
                onClick={onNextPeriod}
            >
                <ChevronRight className="size-4" />
            </Button>
        </div>
    );
};

export default HomeHeaderPeriodControl;
