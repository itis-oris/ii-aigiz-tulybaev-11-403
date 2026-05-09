import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthFormError } from './auth-form-error';

const meta = {
    title: 'Widgets/AuthFormError',
    component: AuthFormError,
    tags: ['autodocs'],
    args: {
        message: 'Неверный email или пароль.',
    },
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof AuthFormError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <div className="w-[360px]">
            <AuthFormError {...args} />
        </div>
    ),
};
