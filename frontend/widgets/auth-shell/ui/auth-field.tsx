import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import { Input } from '@/shared/ui';

type AuthFieldProps = {
    error?: string;
    label: string;
} & ComponentProps<typeof Input>;

export const AuthField = ({
    className,
    error,
    label,
    ...props
}: AuthFieldProps) => {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium">{label}</span>
            <Input
                aria-invalid={Boolean(error)}
                className={cn(
                    'h-10 rounded-md px-3 text-sm md:text-sm',
                    error &&
                        'border-destructive focus-visible:ring-destructive/20',
                    className,
                )}
                {...props}
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
};
