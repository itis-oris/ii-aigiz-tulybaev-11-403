import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './sheet';

const meta = {
    title: 'Shared/Sheet',
    component: Sheet,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Right: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Открыть панель</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Новая задача</SheetTitle>
                    <SheetDescription>
                        Создайте карточку и назначьте исполнителя.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 px-6">
                    <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                        Здесь будет форма создания задачи.
                    </div>
                </div>
                <SheetFooter>
                    <Button>Сохранить</Button>
                    <Button variant="outline">Отмена</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
};

export const Bottom: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Открыть снизу</Button>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                className="mx-auto max-w-3xl rounded-t-xl"
            >
                <SheetHeader>
                    <SheetTitle>Activity</SheetTitle>
                    <SheetDescription>
                        Последние обновления по проекту.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-6 pb-6 text-sm text-muted-foreground">
                    7 новых событий за сегодня.
                </div>
            </SheetContent>
        </Sheet>
    ),
};
