import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { projectOverview } from '@/views/home/model/project-overview';
import OverviewMembersList from './overview-members-list';

const meta = {
    title: 'Views/Home/OverviewMembersList',
    component: OverviewMembersList,
    tags: ['autodocs'],
    args: {
        members: projectOverview.members,
        canManageRoles: true,
        removingMemberId: null,
        transferringOwnerMemberId: null,
        onTransferOwnership: () => {},
        onRemove: () => {},
    },
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof OverviewMembersList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
