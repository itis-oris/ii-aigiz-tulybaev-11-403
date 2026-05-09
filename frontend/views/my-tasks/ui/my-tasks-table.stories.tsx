import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { myTasksGroups } from '@/views/my-tasks/model';
import MyTasksTable from './my-tasks-table';

const defaultExpandedGroupIds = myTasksGroups
    .filter((group) => group.expanded)
    .map((group) => group.id);

const meta = {
    title: 'Views/MyTasks/Table',
    component: MyTasksTable,
    tags: ['autodocs'],
    args: {
        groups: myTasksGroups,
        expandedGroupIds: defaultExpandedGroupIds,
    },
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof MyTasksTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => {
        const [expandedGroupIds, setExpandedGroupIds] = useState(
            args.expandedGroupIds,
        );

        return (
            <MyTasksTable
                {...args}
                expandedGroupIds={expandedGroupIds}
                onToggleGroup={(groupId) =>
                    setExpandedGroupIds((current) =>
                        current.includes(groupId)
                            ? current.filter((id) => id !== groupId)
                            : [...current, groupId],
                    )
                }
            />
        );
    },
};
