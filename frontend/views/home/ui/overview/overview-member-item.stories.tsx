import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { projectOverview } from '@/views/home/model/project-overview';
import OverviewMemberItem from './overview-member-item';

const meta = {
    title: 'Views/Home/OverviewMemberItem',
    component: OverviewMemberItem,
    tags: ['autodocs'],
    args: {
        member: projectOverview.members[0],
    },
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof OverviewMemberItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
