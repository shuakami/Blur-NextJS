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
    onClose
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
        await downloadImage(currentImage, alt);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-0 shadow-none overflow-hidden"
                onWheel={handleWheel as any}
            >
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* 下载按钮 */}
                <button
                    onClick={handleDownload}
                    className="absolute right-16 top-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                    <Download className="w-5 h-5 text-white" />
                </button>

                {/* 缩放控制按钮 */}
                <div className="absolute left-4 top-4 z-50 flex gap-2">
                    <button
                        onClick={() => handleZoom(0.1)}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        disabled={scale >= 3}
                    >
                        <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => handleZoom(-0.1)}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        disabled={scale <= 0.5}
                    >
                        <ZoomOut className="w-5 h-5 text-white" />
                    </button>
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

                {/* 图片容器 */}
                <div 
                    className="w-full h-full flex items-center justify-center"
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <img
                        src={currentImage}
                        alt={alt}
                        className={cn(
                            'max-w-[95vw] max-h-[95vh] rounded-md object-contain select-none transition-transform',
                            isDragging && 'cursor-grabbing',
                            scale > 1 && !isDragging && 'cursor-grab'
                        )}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.2s'
                        }}
                        draggable={false}
                    />
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