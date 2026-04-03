import type { PropsWithChildren } from 'react';

type ContainerProps = PropsWithChildren<{
    className?: string;
}>;

export function Container({ children, className = '' }: ContainerProps) {
    return (
        <div
            className={`mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 ${className}`.trim()}
        >
            {children}
        </div>
    );
}
