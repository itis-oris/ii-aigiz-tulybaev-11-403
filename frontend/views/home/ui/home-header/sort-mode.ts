export const sortModes = [
    'По умолчанию',
    'Дедлайн ближе',
    'Дедлайн дальше',
    'Приоритет выше',
    'Название А-Я',
] as const;

export type SortMode = (typeof sortModes)[number];
