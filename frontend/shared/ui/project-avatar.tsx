import type { ComponentProps } from 'react';
import Image from 'next/image';

import { Avatar } from './avatar';

type ProjectAvatarProps = {
    imageUrl?: string | null;
    fallback: string;
    alt: string;
    className?: string;
    size?: ComponentProps<typeof Avatar>['size'];
    shape?: ComponentProps<typeof Avatar>['shape'];
};

export function ProjectAvatar({
    imageUrl,
    fallback,
    alt,
    className,
    size = 'md',
    shape = 'square',
}: ProjectAvatarProps) {
    return (
        <Avatar size={size} shape={shape} className={className}>
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={alt}
                    width={64}
                    height={64}
                    unoptimized
                    className="size-full rounded-[inherit] object-cover"
                />
            ) : (
                fallback
            )}
        </Avatar>
    );
}
