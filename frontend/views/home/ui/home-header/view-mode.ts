export const viewModes = ['Неделя', 'Месяц', 'Доски'] as const;

export type ViewMode = (typeof viewModes)[number];
