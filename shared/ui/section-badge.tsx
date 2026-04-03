import type { ReactNode } from 'react';

type SectionBadgeProps = {
    children: ReactNode;
};

export function SectionBadge({ children }: SectionBadgeProps) {
    return (
        <span className="inline-flex items-center rounded-full border border-line bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
            {children}
        </span>
    );
}
