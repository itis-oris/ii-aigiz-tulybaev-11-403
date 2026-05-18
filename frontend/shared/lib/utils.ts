import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = 5;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getImageUploadError = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return `Изображение не должно быть больше ${MAX_IMAGE_SIZE_MB} МБ`;
    }

    return null;
};
