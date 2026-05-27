import type { Preview } from '@storybook/nextjs-vite';
import { AppProviders } from '@/app/providers';
import '@/app/globals.css';
import './fonts.css';

const preview: Preview = {
    decorators: [
        (Story) => (
            <AppProviders>
                <div className="min-h-screen bg-background p-4 text-foreground antialiased">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: 'centered',
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },

        a11y: {
            test: 'todo',
        },
    },
};

export default preview;
