import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Info } from 'lucide-react';
import { Button } from './button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './tooltip';

const meta = {
    title: 'Shared/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Info />
                    </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                    Подсказка для кнопки действия
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ),
};
