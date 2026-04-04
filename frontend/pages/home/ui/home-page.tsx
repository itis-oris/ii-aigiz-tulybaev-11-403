import { HomeHero } from '@/widgets/home-hero/ui/home-hero';
import { SetupOverview } from '@/widgets/setup-overview/ui/setup-overview';

export function HomePage() {
    return (
        <main>
            <HomeHero />
            <SetupOverview />
        </main>
    );
}
