import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const inputVariants = cva(
    'w-full min-w-0 rounded-md border border-input bg-input/20 transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    {
        variants: {
            size: {
                default:
                    'h-7 px-2 py-0.5 text-sm file:h-6 file:text-xs/relaxed md:text-xs/relaxed',
                md: 'h-9 px-3 text-sm file:h-7 file:text-sm',
                lg: 'h-10 px-3 text-sm file:h-8 file:text-sm',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    },
);

function Input({
    className,
    type,
    uiSize,
    ...props
}: React.ComponentProps<'input'> &
    VariantProps<typeof inputVariants> & {
        uiSize?: VariantProps<typeof inputVariants>['size'];
    }) {
    return (
        <input
            type={type}
            data-slot="input"
            data-size={uiSize}
            className={cn(inputVariants({ size: uiSize, className }))}
            {...props}
        />
    );
}

export { Input, inputVariants };
