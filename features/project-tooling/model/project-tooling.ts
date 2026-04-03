import type { StackItem } from '@/entities/frontend-stack/model/frontend-stack';

export const toolingStack: StackItem[] = [
    { id: 'eslint', label: 'ESLint for TypeScript and Next.js rules' },
    { id: 'prettier', label: 'Prettier for deterministic formatting' },
    { id: 'stylelint', label: 'Stylelint for CSS and Tailwind-aware checks' },
    {
        id: 'lint-staged',
        label: 'lint-staged and Husky for pre-commit verification',
    },
];
