import React, { useEffect, useState, useMemo, useRef } from 'react';
import NextImage from 'next/image';
import { cn } from '../../../lib/utils/utils';
import { ImageOff, ZoomIn } from 'lucide-react';
import { useImageZoom } from '../../../hooks/ui/useImageZoom';
import { useImageNavigation } from '../../../hooks/features/useImageNavigation';
import dynamic from 'next/dynamic';

interface ImageProps {
    src?: string;
    alt?: string;
    className?: string;
    priority?: boolean;
}

export const Image: React.FC<ImageProps> = ({ 
    src, 
    alt = '', 
    className = '',
    priority = false,
    ...props 
}) => {
    const [isLoading, setIsLoading] = useState(() => !priority);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [error, setError] = useState<boolean>(false);
    
    const [isOpen, setIsOpen] = useState(false);
    const DialogComponent = useMemo(() => dynamic(
        () => import('@/components/ui/markdown/ImageDialog').then(mod => mod.ImageDialog),
        { ssr: false }
    ), []);

    // 确保src的引用不会丢失
    const srcRef = useRef(src);
    useEffect(() => {
        srcRef.current = src;
    }, [src]);

    const {
        resetImageState
    } = useImageZoom({
        isOpen,
        onClose: () => setIsOpen(false)
    });

    const {
    } = useImageNavigation({
        initialSrc: srcRef.current,
        onReset: resetImageState
    });

    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!src) return;
        
        let mounted = true;
        const img = new window.Image();
        
        if (priority) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        }

        img.src = src;
        
        img.onload = () => {
            if (!mounted) return;
            setAspectRatio(img.width / img.height);
            setIsLoading(false);
        };
        
        img.onerror = () => {
            if (!mounted) return;
            setError(true);
            setIsLoading(false);
        };

        return () => {
            mounted = false;
        };
    }, [src, priority]);

    // 只在没有 src 时显示错误状态
    if (!src) {
        return (
            <div className="my-4 w-full h-48 bg-muted/30 dark:bg-muted/10 flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 dark:border-muted-foreground/20 backdrop-blur-sm">
                <ImageOff 
                    className="w-10 h-10 text-gray-600 dark:text-gray-300 mb-2" 
                    strokeWidth={1.5}
                />
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        未找到图片资源
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div 
                className={cn(
                    'relative w-full overflow-hidden my-4 [--img-hover:0] hover:[--img-hover:1]',
                    'isolation-auto',
                    isLoading ? 'animate-pulse bg-muted dark:bg-muted/20' : 'bg-transparent',
                    !isLoading && 'cursor-zoom-in',
                    className
                )} 
                style={{
                    maxWidth: '100%',
                    aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto',
                }}
                onClick={() => !isLoading && setIsOpen(true)}
            >
                <NextImage
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    className={cn(
                        'w-full h-full object-contain rounded-xl',
                        'transition-all duration-200',
                        isLoading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100',
                        '[filter:brightness(calc(1-0.1*var(--img-hover)))]',
                        'dark:[filter:brightness(calc(1-0.25*var(--img-hover)))]'
                    )}
                    priority={priority}
                    quality={75}
                    loading={priority ? 'eager' : 'lazy'}
                    onLoad={() => {
                        requestAnimationFrame(() => {
                            setIsLoading(false);
                        });
                    }}
                    onError={() => setError(true)}
                    referrerPolicy="no-referrer"
                    {...props}
                />
                
                {!isLoading && (
                    <ZoomIn 
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                            "w-8 h-8 text-white drop-shadow-lg",
                            "transition-opacity duration-200",
                            "opacity-[var(--img-hover)]"
                        )} 
                    />
                )}
            </div>

            {isOpen && (
                <DialogComponent
                    src={srcRef.current || ''}
                    alt={alt}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};