import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const avatarVariants = cva(
    'relative inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap select-none',
    {
        variants: {
            size: {
                xs: 'size-6 text-[10px]',
                sm: 'size-7 text-[11px]',
                md: 'size-8 text-xs',
                lg: 'size-9 text-xs',
                xl: 'size-10 text-sm',
                '2xl': 'size-11 text-sm',
            },
            shape: {
                square: 'rounded-md',
                soft: 'rounded-lg',
                full: 'rounded-full',
            },
        },
        defaultVariants: {
            size: 'md',
            shape: 'full',
        },
    },
);

function Avatar({
    className,
    size,
    shape,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof avatarVariants>) {
    return (
        <div
            data-slot="avatar"
            className={cn(avatarVariants({ size, shape }), className)}
            {...props}
        />
    );
}

export { Avatar, avatarVariants };
