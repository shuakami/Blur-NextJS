import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 用于图像导航的属性接口
 */
interface ImageInfo {
    src: string;
    element: HTMLImageElement | null;
}

interface UseImageNavigationProps {
    initialSrc?: string;
    onReset?: () => void;
}

/**
 * 用于图像导航的返回值接口
 */
interface UseImageNavigationReturn {
    currentImageIndex: number;
    allImages: ImageInfo[];
    handleNavigate: (direction: 'prev' | 'next') => void;
    currentImage: ImageInfo | undefined;
    hasMultipleImages: boolean;
}

/**
 * 获取所有图片的函数
 * @returns {ImageInfo[]} 所有图片的源地址
 */
const getAllImages = (): ImageInfo[] => {
    const images = document.querySelectorAll('img[data-original-src]');
    return Array.from(images)
        .map(img => ({
            src: img.getAttribute('data-original-src') || img.getAttribute('src') || '',
            element: img as HTMLImageElement
        }))
        .filter(({src}) => src && !src.includes('img.clerk.com'));
};

export const useImageNavigation = ({ 
    initialSrc, 
    onReset 
}: UseImageNavigationProps): UseImageNavigationReturn => {
    const initialImagesRef = useRef<ImageInfo[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [allImages, setAllImages] = useState<ImageInfo[]>([]);

    useEffect(() => {
        if (initialSrc && initialImagesRef.current.length === 0) {
            const images = getAllImages();
            initialImagesRef.current = images;
            setAllImages(images);

            const index = images.findIndex(img => 
                img.src === initialSrc || 
                img.src.includes(encodeURIComponent(initialSrc))
            );
            setCurrentImageIndex(index >= 0 ? index : 0);
        }
    }, [initialSrc]);

    const handleNavigate = useCallback((direction: 'prev' | 'next') => {
        if (onReset) {
            onReset();
        }

        setCurrentImageIndex(prev => {
            const totalImages = allImages.length;
            if (totalImages <= 1) return prev;

            if (direction === 'prev') {
                return prev > 0 ? prev - 1 : totalImages - 1;
            }
            return prev < totalImages - 1 ? prev + 1 : 0;
        });
    }, [allImages.length, onReset]);

    const currentImage = allImages[currentImageIndex];
    const hasMultipleImages = allImages.length > 1;

    useEffect(() => {
        // 预加载前后的图片
        const preloadImages = () => {
            const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
            const nextIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;

            [prevIndex, nextIndex].forEach(index => {
                const imgInfo = allImages[index];
                if (!imgInfo?.element) {
                    const img = new Image();
                    img.src = imgInfo.src;
                }
            });
        };

        if (hasMultipleImages) {
            preloadImages();
        }
    }, [currentImageIndex, allImages, hasMultipleImages]);

    return {
        currentImageIndex,
        allImages,
        handleNavigate,
        currentImage,
        hasMultipleImages
    };
}

export { getAllImages };