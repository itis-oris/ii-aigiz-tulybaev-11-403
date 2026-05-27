import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardContent, CardFooter } from '@/shared/ui';
import { Button } from '@/shared/ui/button';
import { AuthCard } from './auth-card';

const meta = {
    title: 'Widgets/AuthCard',
    component: AuthCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof AuthCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Вход в Sprintly',
        description: 'Используйте рабочую почту и пароль.',
        children: null,
    },
    render: () => (
        <AuthCard
            title="Вход в Sprintly"
            description="Используйте рабочую почту и пароль."
        >
            <CardContent className="space-y-4 px-5 py-5 sm:px-6">
                <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                    Здесь будет форма авторизации.
                </div>
            </CardContent>
            <CardFooter className="border-t border-border px-5 py-4 sm:px-6">
                <Button className="w-full">Продолжить</Button>
            </CardFooter>
        </AuthCard>
    ),
};
