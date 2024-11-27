import React, { useEffect, useState, useMemo, useRef } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff, ZoomIn } from 'lucide-react';
import { useImageZoom } from '@/hooks/useImageZoom';
import { useImageNavigation } from '@/hooks/useImageNavigation';
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
    const [isHovered, setIsHovered] = useState(false);
    
    const [isOpen, setIsOpen] = useState(false);
    const DialogComponent = useMemo(() => dynamic(
        () => import('@/components/ui/markdown/ImageDialog').then(mod => mod.ImageDialog),
        { ssr: false }
    ), []);

    const {
        resetImageState
    } = useImageZoom({
        isOpen,
        onClose: () => setIsOpen(false)
    });

    const {
    } = useImageNavigation({
        initialSrc: src,
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
                    className="w-12 h-12 text-gray-600 dark:text-gray-300 mb-2" 
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
                    'relative w-full overflow-hidden my-4',
                    isLoading ? 'animate-pulse bg-muted dark:bg-muted/20' : 'bg-transparent',
                    !isLoading && 'cursor-zoom-in',
                    className
                )} 
                style={{
                    maxWidth: '100%',
                    aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto',
                }}
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
                        'transition-transform duration-300',
                        isLoading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100',
                    )}
                    data-original-src={src}
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
                <div 
                    className={cn(
                        "absolute inset-0 bg-black transition-opacity duration-200",
                        isHovered ? "opacity-10 dark:opacity-20" : "opacity-0"
                    )} 
                />
                <div 
                    className={cn(
                        "absolute inset-0 flex items-center justify-center pointer-events-none",
                        "transition-opacity duration-200",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}
                >
                    <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
            </div>

            {isOpen && (
                <DialogComponent
                    src={src}
                    alt={alt}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
