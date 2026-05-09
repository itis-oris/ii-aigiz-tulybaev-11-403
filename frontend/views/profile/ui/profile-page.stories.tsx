import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProfilePage from './profile-page';

const meta = {
    title: 'Views/Profile/ProfilePage',
    component: ProfilePage,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof ProfilePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
