const normalizeHex = (value: string) => {
    const fallback = '#CBD5E1';
    const normalized = value.trim();

    return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : fallback;
};

const getContrastColor = (hex: string) => {
    const normalized = normalizeHex(hex).slice(1);
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

    return luminance >= 160 ? '#111827' : '#F8FAFC';
};

export const getTagBadgeStyle = (color: string) => {
    const normalized = normalizeHex(color);

    return {
        backgroundColor: normalized,
        borderColor: normalized,
        color: getContrastColor(normalized),
    };
};
