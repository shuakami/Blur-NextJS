import React, { memo } from 'react';
import { cn } from "@/lib/utils/utils";
import { ImageGridProps } from './types';
import { isImageFile } from './utils';
import ImagePreview from './ImagePreview';

const ImageGrid = memo(({ files }: ImageGridProps) => {
    const imageFiles = files.filter(isImageFile);

    if (imageFiles.length === 0) return null;

    const gridClassName = cn(
        "grid gap-2",
        imageFiles.length === 1 ? "grid-cols-1 max-w-64" : "grid-cols-2 max-w-64"
    );

    return (
        <div className="mt-3">
            <div className={gridClassName}>
                {imageFiles.map((file, index) => (
                    <div key={index}>
                        <ImagePreview file={file} />
                    </div>
                ))}
            </div>
        </div>
    );
});

ImageGrid.displayName = 'ImageGrid';

export default ImageGrid; 