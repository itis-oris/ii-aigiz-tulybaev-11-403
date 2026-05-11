'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/shared/lib/utils';
import { buttonVariants } from '@/shared/ui/button';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'flex flex-col gap-4',
                month_caption: 'flex items-center justify-center pt-1 relative',
                caption_label: 'text-sm font-medium',
                nav: 'flex items-center gap-1',
                button_previous: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'absolute left-1 size-7 rounded-md text-muted-foreground',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'absolute right-1 size-7 rounded-md text-muted-foreground',
                ),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday:
                    'w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground',
                week: 'mt-2 flex w-full',
                day: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day_button: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'size-9 rounded-md p-0 font-normal aria-selected:opacity-100',
                ),
                selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                range_start: 'bg-primary text-primary-foreground rounded-l-md',
                range_middle:
                    'bg-accent/40 text-accent-foreground rounded-none',
                range_end: 'bg-primary text-primary-foreground rounded-r-md',
                today: 'bg-accent text-accent-foreground',
                outside:
                    'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                disabled: 'text-muted-foreground opacity-50',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({
                    orientation,
                    className: iconClassName,
                    ...iconProps
                }) =>
                    orientation === 'left' ? (
                        <ChevronLeft
                            className={cn('size-4', iconClassName)}
                            {...iconProps}
                        />
                    ) : (
                        <ChevronRight
                            className={cn('size-4', iconClassName)}
                            {...iconProps}
                        />
                    ),
            }}
            {...props}
        />
    );
}

export { Calendar };
