import type { ProjectSummary } from '@/shared/lib';

export type ProjectListItem = ProjectSummary & {
    ownerName: string;
    ownerInitials: string;
    ownerClassName: string;
    statusLabel: 'В работе' | 'Планирование' | 'На паузе' | 'Завершен';
    dateLabel: string;
};
