import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthFormFooter } from './auth-form-footer';

const meta = {
    title: 'Widgets/AuthFormFooter',
    component: AuthFormFooter,
    tags: ['autodocs'],
    args: {
        text: 'Еще нет аккаунта',
        linkLabel: 'Зарегистрироваться',
        href: '/register',
    },
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof AuthFormFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
