import { cn } from '@/shared/lib';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
    ProjectAvatar,
} from '@/shared/ui';
import type { ProjectSummary } from '@/shared/lib';

type OverviewProjectHeroProps = {
    project: ProjectSummary;
    description: string;
};

const OverviewProjectHero = ({
    project,
    description,
}: OverviewProjectHeroProps) => {
    return (
        <Card className="bg-transparent py-0 ring-0">
            <CardContent className="px-0 py-0">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
                    <ProjectAvatar
                        size="2xl"
                        shape="square"
                        className={cn(
                            'size-24 rounded-3xl bg-primary text-5xl text-primary-foreground shadow-sm ring-1 ring-border',
                            project.avatarClassName,
                        )}
                        imageUrl={project.imageUrl}
                        fallback={project.avatar}
                        alt={project.name}
                    />
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-3xl font-semibold sm:text-4xl">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="mt-4 text-sm leading-7">
                            {description}
                        </CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OverviewProjectHero;
