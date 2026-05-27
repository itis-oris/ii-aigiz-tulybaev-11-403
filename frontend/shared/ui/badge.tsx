import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-md font-medium whitespace-nowrap',
    {
        variants: {
            variant: {
                default: 'bg-secondary text-secondary-foreground',
                accent: 'bg-accent text-accent-foreground',
                subtle: 'bg-muted text-muted-foreground',
                outline: 'border border-border bg-background text-foreground',
                sidebar: 'bg-sidebar text-sidebar-foreground',
            },
            size: {
                sm: 'px-2 py-1 text-[10px] leading-none',
                default: 'px-2.5 py-1 text-xs leading-none',
            },
            shape: {
                default: 'rounded-md',
                pill: 'rounded-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            shape: 'default',
        },
    },
);

function Badge({
    className,
    variant,
    size,
    shape,
    ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
    return (
        <span
            data-slot="badge"
            className={cn(badgeVariants({ variant, size, shape }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
