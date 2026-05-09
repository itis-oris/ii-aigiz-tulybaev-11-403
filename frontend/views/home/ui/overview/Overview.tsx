import { Plus } from 'lucide-react';
import { projectOverview } from '@/views/home/model/project-overview';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/shared/ui';
import OverviewMembersList from './OverviewMembersList';

const Overview = () => {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6">
                    <Card className="py-0 ring-0">
                        <CardContent className="px-0 py-0">
                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
                                <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-black text-5xl text-white shadow-sm ring-1 ring-black/5">
                                    {projectOverview.emoji}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-4xl font-semibold">
                                        {projectOverview.name}
                                    </CardTitle>
                                    <CardDescription className="mt-4 text-sm leading-7">
                                        {projectOverview.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                        <Button size="md">
                            <Plus className="size-4" />
                            Добавить участника
                        </Button>
                    </div>

                    <OverviewMembersList members={projectOverview.members} />
                </div>
            </section>
        </div>
    );
};

export default Overview;
