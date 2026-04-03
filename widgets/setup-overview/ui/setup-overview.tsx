import { ToolingOverview } from '@/features/project-tooling/ui/tooling-overview';
import { architectureLayers } from '@/entities/frontend-stack/model/frontend-stack';
import { toolingStack } from '@/features/project-tooling/model/project-tooling';
import { Container } from '@/shared/ui/container';

export function SetupOverview() {
    return (
        <section className="pb-10 sm:pb-14 lg:pb-20">
            <Container>
                <div className="grid gap-6 lg:grid-cols-2">
                    <ToolingOverview
                        eyebrow="FSD layers"
                        title="Current topology"
                        items={architectureLayers}
                    />
                    <ToolingOverview
                        eyebrow="Code quality"
                        title="Pre-commit pipeline"
                        items={toolingStack}
                    />
                </div>
            </Container>
        </section>
    );
}
