/**
 * @fileoverview 文件上传相关逻辑和组件组合
 * @module components/chat/chat-input/file-upload
 */

import React, { useRef, useCallback, useEffect, useState, memo, useMemo, Suspense } from 'react';
import { useDropzone } from 'react-dropzone';
import { Spinner as SpinnerComponent } from '@/components/ui/spinner';
import { createPortal } from 'react-dom';
import {
    Folder
} from 'lucide-react';
import { chatInputReducer, FileUploadInfo } from './hooks';
import { ScrollArrowButton, RemoveButton, FileProgressIndicator } from './components';
import { useFileTheme } from '@/hooks/ui/useFileTheme';
import dynamic from 'next/dynamic';

// 动态导入 Image 组件
const Image = dynamic(() => import('next/image'), {
    loading: () => <SpinnerComponent size={14} className="text-current" />,
    ssr: false
});

// 预加载文件预览组件
const PreloadFilePreview = () => {
    useEffect(() => {
        const img = document.createElement('img');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 透明图片
    }, []);
    return null;
};

// GlobalDropZone 组件
export const GlobalDropZone = memo(({ onDrop }: { onDrop: (files: File[]) => void }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: useCallback((acceptedFiles: File[]) => onDrop(acceptedFiles), [onDrop]),
        noClick: true,
        multiple: true,
    });

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = (e: DragEvent) => {
            if (!e.relatedTarget) {
                setIsDragging(false);
            }
        };

        const handleDrop = () => {
            setIsDragging(false);
        };

        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('drop', handleDrop);
        };
    }, []);

    const content = (
        <div {...getRootProps()} className={`
            fixed inset-0 z-50
            bg-white/50 dark:bg-black/50 backdrop-blur-sm
            transition-all duration-300 ease-in-out
            ${isDragging ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}
        `}>
            <input {...getInputProps()} />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                    flex flex-col items-center space-y-3
                    transition-transform duration-300 ease-in-out
                    ${isDragging ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}>
                    <Folder className="w-8 h-8" />
                    <h3 className="text-2xl font-normal text-gray-700 dark:text-gray-200">
                        拖放文件到这里
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        支持 PDF、Word、图片等格式 · 最大 10MB
                    </p>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
});

// 防抖函数
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// 文件预览项组件
const FilePreviewItem = memo(({ 
    fileInfo, 
    index,
    onRemove,
    theme,
    formatFileSize
}: {
    fileInfo: FileUploadInfo;
    index: number;
    onRemove: (index: number) => void;
    theme: ReturnType<typeof useFileTheme>['getFileTheme'];
    formatFileSize: (size: number) => string;
}) => {
    const file = fileInfo.file;
    const fileTheme = useMemo(() => theme(file), [theme, file]);
    const isUploading = fileInfo.isUploading;
    const hasError = fileInfo.error;
    const isImage = file.type.startsWith('image/');

    // 使用 ref 存储 URL
    const objectUrlRef = useRef<string>('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (isImage) {
            const handle = window.requestIdleCallback(() => {
                if (!isMounted) return;
                const url = URL.createObjectURL(file);
                objectUrlRef.current = url;
                setIsImageLoaded(true);
            });
            
            return () => {
                isMounted = false;
                window.cancelIdleCallback(handle);
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = '';
                }
            };
        }
    }, [file, isImage]);

    // 使用useMemo缓存要的UI元素
    const fileIcon = useMemo(() => (
        <div className={`
            w-10 h-10 rounded-lg 
            flex items-center justify-center
            transition-colors duration-300
            ${hasError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700/30'}
        `}>
            <fileTheme.icon
                size={20}
                className={`
                    ${hasError ? 'text-red-500' : ''}
                    ${isUploading ? 'opacity-50' : 'opacity-100'}
                    transition-opacity duration-200
                `}
                style={{ color: !hasError ? fileTheme.color : undefined }}
            />
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <SpinnerComponent size={14} className="text-current" />
                </div>
            )}
        </div>
    ), [fileTheme, hasError, isUploading]);

    return (
        <div className="group relative shrink-0">
            <div className={`
                flex items-center gap-3 rounded-xl 
                bg-white dark:bg-gray-900
                border border-gray-100 dark:border-gray-800
                shadow-sm
                py-2 px-3
                min-w-[240px]
                transition-[shadow,border-color] duration-200
                group-hover:shadow-md
                group-hover:border-gray-200 dark:group-hover:border-gray-700
                ${hasError ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : ''}
            `}>
                <div className="relative flex-shrink-0">
                    {isImage ? (
                        <div className={`
                            w-10 h-10 rounded-lg overflow-hidden
                            ${hasError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700/30'}
                        `}>
                            <Suspense fallback={<SpinnerComponent size={14} className="text-current" />}>
                                {isImageLoaded && objectUrlRef.current && (
                                    <Image
                                        src={objectUrlRef.current}
                                        alt={file.name}
                                        className={`
                                            w-full h-full object-cover
                                            ${isUploading ? 'opacity-50' : 'opacity-100'}
                                            transition-opacity duration-200
                                        `}
                                        width={48}
                                        height={48}
                                        loading="eager"
                                        priority={index < 3}
                                    />
                                )}
                            </Suspense>
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <SpinnerComponent size={14} className="text-current" />
                                </div>
                            )}
                        </div>
                    ) : (
                        fileIcon
                    )}
                </div>

                <div className="flex flex-col min-w-0 flex-1 justify-center py-0.5">
                    <span className="text-[13px] leading-none font-medium text-gray-700 dark:text-gray-200 truncate">
                        {file.name.length > 25 ? `${file.name.slice(0, 25)}...` : file.name}
                    </span>
                    <div className="flex items-center flex-wrap gap-x-1.5 text-[11px] leading-none mt-1.5">
                        <span className="text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                        </span>
                        {!hasError && fileInfo.progress < 100 && (
                            <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <FileProgressIndicator progress={fileInfo.progress} theme={fileTheme} />
                            </>
                        )}
                        {hasError && (
                            <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-red-500 dark:text-red-400 truncate">
                                    {fileInfo.error}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <RemoveButton 
                onClick={() => onRemove(index)}
                disabled={isUploading}
                className="absolute -right-1 -top-1
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200"
            />
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.fileInfo.isUploading === nextProps.fileInfo.isUploading &&
        prevProps.fileInfo.error === nextProps.fileInfo.error &&
        prevProps.fileInfo.progress === nextProps.fileInfo.progress &&
        prevProps.index === nextProps.index
    );
});

// FilePreview 组件
interface FilePreviewProps {
    files: FileUploadInfo[];
    onRemove: (index: number) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = memo(({ 
    files, 
    onRemove
}) => {
    const { getFileTheme, formatFileSize } = useFileTheme();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // 使用防抖的滚动检查
    const checkScroll = useMemo(() => debounce(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setShowLeftArrow(el.scrollLeft > 0);
        setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }, 100), []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        el.addEventListener('scroll', checkScroll, { passive: true });
        const resizeObserver = new ResizeObserver(checkScroll);
        resizeObserver.observe(el);
        checkScroll();

        return () => {
            el.removeEventListener('scroll', checkScroll);
            resizeObserver.disconnect();
        };
    }, [checkScroll]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }, []);

    if (files.length === 0) return null;

    return (
        <>
            <PreloadFilePreview />
            <div className="relative px-4 py-2 max-h-[240px]">
                {showLeftArrow && (
                    <>
                        <div className="absolute left-0 top-0 bottom-0 w-16 
                                    bg-gradient-to-r from-white via-white/90 to-transparent 
                                    dark:from-[#212121] dark:via-[#212121]/90 dark:to-transparent
                                    pointer-events-none z-10" />
                        <ScrollArrowButton direction="left" onClick={() => scroll('left')} />
                    </>
                )}

                <div ref={scrollContainerRef} 
                    className="overflow-x-auto py-1 hide-scrollbar"
                    style={{ willChange: 'scroll-position' }}>
                    <div className="inline-flex gap-3">
                        {files.map((fileInfo, index) => (
                            <FilePreviewItem
                                key={fileInfo.id}
                                fileInfo={fileInfo}
                                index={index}
                                onRemove={onRemove}
                                theme={getFileTheme}
                                formatFileSize={formatFileSize}
                            />
                        ))}
                    </div>
                </div>

                {showRightArrow && (
                    <>
                        <div className="absolute right-0 top-0 bottom-0 w-16 
                                    bg-gradient-to-l from-white via-white/90 to-transparent
                                    dark:from-[#212121] dark:via-[#212121]/90 dark:to-transparent 
                                    pointer-events-none z-10" />
                        <ScrollArrowButton direction="right" onClick={() => scroll('right')} />
                    </>
                )}
            </div>
        </>
    );
});

GlobalDropZone.displayName = 'GlobalDropZone';
FilePreview.displayName = 'FilePreview';
FilePreviewItem.displayName = 'FilePreviewItem';
