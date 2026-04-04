export type StackItem = {
    id: string;
    label: string;
};

export const frontendStack: StackItem[] = [
    { id: 'next', label: 'Next.js 16' },
    { id: 'react', label: 'React 19' },
    { id: 'tailwind', label: 'Tailwind 4' },
];

export const architectureLayers: StackItem[] = [
    { id: 'app', label: 'app for routes, providers and global entry points' },
    { id: 'pages', label: 'pages for route-level screen composition' },
    { id: 'widgets', label: 'widgets for page sections and assembled blocks' },
    { id: 'features', label: 'features for isolated user scenarios' },
    { id: 'entities', label: 'entities for domain-focused slices and models' },
    { id: 'shared', label: 'shared for UI kit, config and generic utilities' },
];
