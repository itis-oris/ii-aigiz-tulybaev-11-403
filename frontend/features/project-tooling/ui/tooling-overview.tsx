import type { StackItem } from '@/entities/frontend-stack/model/frontend-stack';

type ToolingOverviewProps = {
    eyebrow: string;
    title: string;
    items: StackItem[];
};

export function ToolingOverview({
    eyebrow,
    title,
    items,
}: ToolingOverviewProps) {
    return (
        <article className="rounded-[1.75rem] border border-line bg-surface-strong p-6 shadow-[var(--shadow)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-brand-strong">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {title}
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted sm:text-base">
                {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-brand" />
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
