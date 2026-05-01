import { Dot, Plus } from 'lucide-react';
import { projectOverview } from '@/pages/home/model/project-overview';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';

const Overview = () => {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="mx-auto mt-10 w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-28 shrink-0 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#89c5ff_0%,#f6dd52_100%)] text-6xl shadow-sm ring-1 ring-black/5">
                            {projectOverview.emoji}
                        </div>
                        <div className="min-w-0 pt-2">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                                        projectOverview.statusToneClassName,
                                    )}
                                >
                                    <Dot className="size-4" />
                                    {projectOverview.status}
                                </span>
                            </div>
                            <h1 className="text-4xl font-semibold text-foreground">
                                {projectOverview.name}
                            </h1>
                        </div>
                    </div>

                    <div className="bg-muted/35 px-5 py-4 text-sm leading-7 text-foreground">
                        {projectOverview.description}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                Участники
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Команда, которая работает над проектом и ведет
                                текущие задачи.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="h-9 rounded-full px-3 text-sm text-muted-foreground"
                        >
                            <Plus className="size-4" />
                            Добавить участника
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {projectOverview.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background px-4 py-3"
                            >
                                <div
                                    className={cn(
                                        'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                        member.accentClassName,
                                    )}
                                >
                                    {member.initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-foreground">
                                        {member.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {member.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Overview;
