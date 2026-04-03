import { frontendStack } from '@/entities/frontend-stack/model/frontend-stack';
import { StackPills } from '@/entities/frontend-stack/ui/stack-pills';
import { Container } from '@/shared/ui/container';
import { SectionBadge } from '@/shared/ui/section-badge';

export function HomeHero() {
    return (
        <section className="relative overflow-hidden py-10 sm:py-14 lg:py-20">
            <Container>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                    <div className="rounded-[2rem] border border-line bg-surface px-6 py-8 shadow-[var(--shadow)] backdrop-blur sm:px-8 sm:py-10 lg:px-10">
                        <SectionBadge>Frontend platform</SectionBadge>
                        <div className="mt-6 max-w-2xl">
                            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
                                Sprinly frontend is now structured around
                                scalable slices.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
                                The starter template is replaced with an App
                                Router shell that keeps routes in{' '}
                                <span className="font-mono">app/</span> and
                                moves reusable code into dedicated FSD layers.
                            </p>
                        </div>
                        <StackPills items={frontendStack} />
                    </div>

                    <aside className="rounded-[1.75rem] border border-line bg-brand px-6 py-6 text-white shadow-[var(--shadow)] sm:px-8">
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/72">
                            Route policy
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                            `app/` stays thin and delegates the real page tree
                            to slices.
                        </h2>
                        <p className="mt-4 text-sm leading-6 text-white/80 sm:text-base">
                            Pages now compose widgets, widgets depend on
                            features and entities, and domain-free primitives
                            stay in shared. This keeps future growth
                            predictable.
                        </p>
                    </aside>
                </div>
            </Container>
        </section>
    );
}
