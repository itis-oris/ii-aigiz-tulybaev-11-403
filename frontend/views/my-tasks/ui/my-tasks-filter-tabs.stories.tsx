import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { myTasksFilters, type MyTasksFilter } from '@/views/my-tasks/model';
import MyTasksFilterTabs from './my-tasks-filter-tabs';

const meta = {
    title: 'Views/MyTasks/FilterTabs',
    component: MyTasksFilterTabs,
    tags: ['autodocs'],
    args: {
        filters: myTasksFilters,
        activeFilter: myTasksFilters[0],
    },
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof MyTasksFilterTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => {
        const [activeFilter, setActiveFilter] = useState<MyTasksFilter>(
            args.activeFilter,
        );

        return (
            <MyTasksFilterTabs
                {...args}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
        );
    },
};
