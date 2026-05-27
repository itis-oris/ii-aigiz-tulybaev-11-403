import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthField } from './auth-field';

const meta = {
    title: 'Widgets/AuthField',
    component: AuthField,
    tags: ['autodocs'],
    args: {
        label: 'Email',
        placeholder: 'team@sprintly.app',
    },
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof AuthField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div className="w-[360px]">
            <AuthField {...args} />
        </div>
    ),
};

export const Error: Story = {
    render: () => (
        <div className="w-[360px]">
            <AuthField
                label="Пароль"
                type="password"
                error="Пароль должен содержать не менее 8 символов."
                defaultValue="12345"
            />
        </div>
    ),
};
