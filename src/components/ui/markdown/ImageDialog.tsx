import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageZoom } from '@/hooks/useImageZoom';
import { useImageNavigation } from '@/hooks/useImageNavigation';
import { ZoomIn, X, Download, ChevronLeft, ChevronRight, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadImage } from '@/lib/image/download';

interface ImageDialogProps {
    src: string;
    alt?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ImageDialog: React.FC<ImageDialogProps> = ({
    src,
    alt,
    isOpen,
    onClose,
}) => {
    const {
        scale,
        position,
        isDragging,
        handleWheel,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp,
        handleZoom,
        resetImageState
    } = useImageZoom({
        isOpen,
        onClose
    });

    const {
        currentImage,
        hasMultipleImages,
        handleNavigate,
        currentImageIndex,
        allImages
    } = useImageNavigation({
        initialSrc: src,
        onReset: resetImageState
    });

    const handleDownload = async () => {
        if (!currentImage) return;
        await downloadImage(currentImage.src, alt);
    };

    // 检测操作系统
    const isMac = navigator.userAgent.includes('Mac');
    const ctrlKey = isMac ? '⌘' : 'Ctrl';

    // 添加图片尺寸状态
    const [imageDimensions, setImageDimensions] = React.useState<{
        width: number;
        height: number;
    } | null>(null);

    // 获取图片原始尺寸
    React.useEffect(() => {
        if (currentImage?.element) {
            setImageDimensions({
                width: currentImage.element.naturalWidth,
                height: currentImage.element.naturalHeight
            });
        } else if (currentImage?.src) {
            const img = new Image();
            img.onload = () => {
                setImageDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.src = currentImage.src;
        }
    }, [currentImage]);

    // 计算合适的初始尺寸
    const calculateInitialSize = () => {
        if (!imageDimensions) return { width: 'auto', height: 'auto' };

        const padding = 48; // 边距
        const maxWidth = window.innerWidth - (padding * 2);
        const maxHeight = window.innerHeight - (padding * 2);

        const ratio = Math.min(
            maxWidth / imageDimensions.width,
            maxHeight / imageDimensions.height,
            1 // 不放大小图
        );

        return {
            width: Math.round(imageDimensions.width * ratio),
            height: Math.round(imageDimensions.height * ratio)
        };
    };

    const initialSize = calculateInitialSize();

    // 使用src作为后备值
    const imageSrc = currentImage?.element?.src || currentImage?.src || src;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="w-screen min-w-full h-screen p-0 m-0 bg-transparent border-0 shadow-none md:rounded-none overflow-hidden select-none"
                onWheel={handleWheel as any}
            >
                {/* 控制按钮容器 - 确保在最上层 */}
                <div className="fixed inset-0 z-50 pointer-events-none">
                    {/* 关闭按钮 */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 pointer-events-auto p-2 rounded-full bg-gray-100/80 dark:bg-black/50 hover:bg-gray-200/90 dark:hover:bg-black/70 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-700 dark:text-white" />
                    </button>

                    {/* 下载按钮 */}
                    <button
                        onClick={handleDownload}
                        className="absolute right-16 top-4 pointer-events-auto p-2 rounded-full bg-gray-100/80 dark:bg-black/50 hover:bg-gray-200/90 dark:hover:bg-black/70 transition-colors"
                    >
                        <Download className="w-5 h-5 text-gray-700 dark:text-white" />
                    </button>

                    {/* 缩放控制按钮和提示 */}
                    <div className="absolute left-4 top-4 pointer-events-auto">
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => handleZoom(0.1)}
                                className="p-2 rounded-full bg-gray-100/80 dark:bg-black/50 hover:bg-gray-200/90 dark:hover:bg-black/70 transition-colors disabled:opacity-50"
                                disabled={scale >= 3}
                            >
                                <ZoomIn className="w-5 h-5 text-gray-700 dark:text-white" />
                            </button>
                            <button
                                onClick={() => handleZoom(-0.1)}
                                className="p-2 rounded-full bg-gray-100/80 dark:bg-black/50 hover:bg-gray-200/90 dark:hover:bg-black/70 transition-colors disabled:opacity-50"
                                disabled={scale <= 0.5}
                            >
                                <ZoomOut className="w-5 h-5 text-gray-700 dark:text-white" />
                            </button>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-white/70 bg-gray-100/80 dark:bg-black/50 px-2 py-1 rounded">
                            {ctrlKey} + 滚轮缩放
                        </div>
                    </div>

                    {/* 导航按钮 */}
                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={() => handleNavigate('prev')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={() => handleNavigate('next')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </>
                    )}

                    {/* 图片计数器 */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                            {currentImageIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>

                {/* 图片容器 */}
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95"
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div 
                        className="relative flex items-center justify-center"
                        style={{
                            touchAction: 'none',
                            userSelect: 'none',
                            width: initialSize.width,
                            height: initialSize.height,
                        }}
                    >
                        <img
                            src={imageSrc}
                            alt={alt}
                            className={cn(
                                'object-contain select-none',
                                'will-change-transform',
                                isDragging && 'cursor-grabbing',
                                scale > 1 && !isDragging && 'cursor-grab',
                                scale <= 1 && 'cursor-default'
                            )}
                            style={{
                                width: initialSize.width,
                                height: initialSize.height,
                                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                                transformOrigin: 'center center',
                                pointerEvents: scale <= 1 ? 'none' : 'auto',
                            }}
                            draggable={false}
                            loading="eager"
                            onDragStart={e => e.preventDefault()}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};