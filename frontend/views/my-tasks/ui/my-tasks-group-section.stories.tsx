import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { myTasksGroups } from '@/views/my-tasks/model';
import MyTasksGroupSection from './my-tasks-group-section';

const meta = {
    title: 'Views/MyTasks/GroupSection',
    component: MyTasksGroupSection,
    tags: ['autodocs'],
    args: {
        group: myTasksGroups[0],
        isExpanded: true,
    },
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta<typeof MyTasksGroupSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => {
        const [isExpanded, setIsExpanded] = useState(args.isExpanded);

        return (
            <div className="min-w-[1380px] bg-background">
                <MyTasksGroupSection
                    {...args}
                    isExpanded={isExpanded}
                    onToggle={() => setIsExpanded((value) => !value)}
                />
            </div>
        );
    },
};
