import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './card';

const meta = {
    title: 'Shared/Card',
    component: Card,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <div className="w-[360px]">
            <Card>
                <CardHeader>
                    <CardTitle>Project Summary</CardTitle>
                    <CardDescription>
                        Короткий статус по активному проекту.
                    </CardDescription>
                    <CardAction>
                        <Button variant="outline" size="sm">
                            Открыть
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        12 задач в работе, 3 ожидают согласования, ближайший
                        релиз запланирован на пятницу.
                    </p>
                </CardContent>
                <CardFooter className="border-t border-border">
                    <Button size="sm">Перейти к задачам</Button>
                </CardFooter>
            </Card>
        </div>
    ),
};

export const Small: Story = {
    render: () => (
        <div className="w-[280px]">
            <Card size="sm">
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>
                        4 непрочитанных уведомления
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Последний комментарий пришел 12 минут назад.
                    </p>
                </CardContent>
            </Card>
        </div>
    ),
};
