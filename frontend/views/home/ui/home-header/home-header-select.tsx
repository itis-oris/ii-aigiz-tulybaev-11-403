import { ChevronsUpDown } from 'lucide-react';
import type { HomeHeaderSelectOption } from './home-header.types';

type HomeHeaderSelectProps<T extends string> = {
    value?: T;
    options: HomeHeaderSelectOption<T>[];
    onChange?: (value: T) => void;
    className?: string;
};

const HomeHeaderSelect = <T extends string>({
    value,
    options,
    onChange,
    className,
}: HomeHeaderSelectProps<T>) => (
    <div className={className ?? 'relative'}>
        <select
            value={value}
            onChange={(event) => onChange?.(event.target.value as T)}
            className="h-8 w-full cursor-pointer appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-ring"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
);

export default HomeHeaderSelect;
