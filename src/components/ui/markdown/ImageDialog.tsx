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
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? '⌘' : 'Ctrl';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-0 shadow-none overflow-hidden select-none"
                onWheel={handleWheel as any}
            >
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 p-2 rounded-full bg-gray-100/80 dark:bg-black/50 hover:bg-gray-200/90 dark:hover:bg-black/70 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>

                {/* 下载按钮 */}
                <button
                    onClick={handleDownload}
                    className="absolute right-16 top-4 z-50 p-2 rounded-full bg-gray-100/80 dark:bg-black/50 hover:bg-gray-200/90 dark:hover:bg-black/70 transition-colors"
                >
                    <Download className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>

                {/* 缩放控制按钮和提示 */}
                <div className="absolute left-4 top-4 z-50">
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
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={() => handleNavigate('next')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </>
                )}

                {/* 优化图片容器 */}
                <div 
                    className="w-screen h-screen flex items-center justify-center bg-white/95 dark:bg-gray-900"
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div 
                        className="relative flex items-center justify-center"
                        style={{
                            width: '100%',
                            height: '100%',
                            touchAction: 'none',
                            userSelect: 'none',
                        }}
                    >
                        <img
                            src={currentImage?.element?.src || currentImage?.src}
                            alt={alt}
                            className={cn(
                                'max-w-[90vw] max-h-[90vh] w-auto h-auto',
                                'object-contain select-none',
                                'will-change-transform',
                                isDragging && 'cursor-grabbing',
                                scale > 1 && !isDragging && 'cursor-grab',
                                scale <= 1 && 'cursor-default'
                            )}
                            style={{
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

                {/* 图片计数器 */}
                {hasMultipleImages && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};