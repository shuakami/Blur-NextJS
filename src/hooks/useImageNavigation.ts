import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 用于图像导航的属性接口
 */
interface UseImageNavigationProps {
    initialSrc?: string;
    onReset?: () => void;
}

/**
 * 用于图像导航的返回值接口
 */
interface UseImageNavigationReturn {
    currentImageIndex: number;
    allImages: string[];
    handleNavigate: (direction: 'prev' | 'next') => void;
    currentImage: string | undefined;
    hasMultipleImages: boolean;
}

/**
 * 获取所有图片的函数
 * @returns {string[]} 所有图片的源地址
 */
const getAllImages = (): string[] => {
    const images = document.querySelectorAll('img');
    return Array.from(images)
        .map(img => {
            const originalSrc = img.getAttribute('data-original-src') || img.getAttribute('src');
            return originalSrc || '';
        })
        .filter(src => src && !src.includes('img.clerk.com'));
};

export const useImageNavigation = ({ 
    initialSrc, 
    onReset 
}: UseImageNavigationProps): UseImageNavigationReturn => {
    const initialImagesRef = useRef<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [allImages, setAllImages] = useState<string[]>([]);

    useEffect(() => {
        if (initialSrc && initialImagesRef.current.length === 0) {
            const images = getAllImages();
            initialImagesRef.current = images;
            setAllImages(images);

            const index = images.findIndex(imgSrc => 
                imgSrc === initialSrc || 
                imgSrc.includes(encodeURIComponent(initialSrc))
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

    return {
        currentImageIndex,
        allImages,
        handleNavigate,
        currentImage,
        hasMultipleImages
    };
}

export { getAllImages };