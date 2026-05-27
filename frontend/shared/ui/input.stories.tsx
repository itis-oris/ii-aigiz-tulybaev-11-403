import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './input';

const meta = {
    title: 'Shared/Input',
    component: Input,
    tags: ['autodocs'],
    args: {
        placeholder: 'Название задачи',
        uiSize: 'md',
    },
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: (args) => (
        <div className="w-[320px]">
            <Input {...args} />
        </div>
    ),
};

export const States: Story = {
    render: () => (
        <div className="flex w-[320px] flex-col gap-4">
            <Input uiSize="default" placeholder="Быстрый ввод" />
            <Input
                uiSize="md"
                placeholder="Email"
                defaultValue="team@sprintly.app"
            />
            <Input
                uiSize="lg"
                aria-invalid
                defaultValue="Слишком короткое название"
            />
            <Input uiSize="md" disabled defaultValue="Недоступно" />
        </div>
    ),
};
