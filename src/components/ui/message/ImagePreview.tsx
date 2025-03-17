import React, { memo } from 'react';
import { Image } from "@/components/ui/markdown/image";
import { ImagePreviewProps } from './types';
import { getImageUrl, getImageName } from './utils';

const ImagePreview = memo(({ file }: ImagePreviewProps) => {
    const imageUrl = getImageUrl(file);
    const imageName = getImageName(file);
    
    return (
        <div className="relative overflow-hidden">
            <Image
                src={imageUrl || ''}
                alt={imageName}
                className="w-full h-full object-cover my-0"
            />
        </div>
    );
});

ImagePreview.displayName = 'ImagePreview';

export default ImagePreview; 