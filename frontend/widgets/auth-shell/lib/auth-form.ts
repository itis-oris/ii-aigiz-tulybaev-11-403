import type { ComponentProps } from 'react';

export type AuthFieldConfig<T extends string> = {
    name: T;
    label: string;
    placeholder: string;
    type?: ComponentProps<'input'>['type'];
    autoComplete?: string;
};

export type FieldErrors<T extends string> = Partial<Record<T, string>>;
