import type { StackItem } from '@/entities/frontend-stack/model/frontend-stack';

type StackPillsProps = {
    items: StackItem[];
};

export function StackPills({ items }: StackPillsProps) {
    return (
        <div className="mt-8 flex flex-wrap gap-3">
            {items.map((item, index) => {
                const isPrimary = index === 0;

                return (
                    <span
                        key={item.id}
                        className={
                            isPrimary
                                ? 'rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white'
                                : 'rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-semibold text-foreground'
                        }
                    >
                        {item.label}
                    </span>
                );
            })}
        </div>
    );
}
