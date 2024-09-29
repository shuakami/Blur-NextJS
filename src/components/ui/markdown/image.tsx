import React from 'react';
import NextImage from 'next/image';

interface ImageProps {
    src?: string;
    alt?: string;
}

export const Image: React.FC<ImageProps> = ({src, alt = '', ...props}) => {
    if (!src) {
        // 如果 src 不是有效的字符串，直接返回 null 以避免错误
        return null;
    }

    return (
        <div style={{position: 'relative', width: '100%', height: 'auto'}} className="inline-image-container">
            <NextImage
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 800px) 100vw, 800px"
                style={{objectFit: 'contain'}}
                {...props}
            />
        </div>
    );
};
