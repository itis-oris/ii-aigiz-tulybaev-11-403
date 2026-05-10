import type { ProjectSummary } from '@/shared/lib';

export type ProjectListItem = ProjectSummary & {
    ownerName: string;
    ownerInitials: string;
    ownerClassName: string;
    status: 'В работе' | 'Планирование';
    dateLabel: string;
};
