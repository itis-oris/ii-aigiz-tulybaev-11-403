import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardContent, CardFooter } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { AuthCard } from './auth-card';
import { AuthPageShell } from './auth-page-shell';

const meta = {
    title: 'Widgets/AuthPageShell',
    component: AuthPageShell,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof AuthPageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: null,
    },
    render: () => (
        <AuthPageShell>
            <AuthCard
                title="Создать аккаунт"
                description="Подключите команду к Sprintly."
            >
                <CardContent className="space-y-3 px-5 py-5 sm:px-6">
                    <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                        Макет формы регистрации.
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border px-5 py-4 sm:px-6">
                    <Button className="w-full">Начать</Button>
                </CardFooter>
            </AuthCard>
        </AuthPageShell>
    ),
};
