/**
 * @fileoverview 文件上传相关逻辑和组件组合
 * @module components/chat/chat-input/file-upload
 */

import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Spinner as SpinnerComponent } from '@/components/ui/spinner';
import {
    Folder
} from 'lucide-react';
import { chatInputReducer } from './hooks';
import { ScrollArrowButton, RemoveButton, FileProgressIndicator } from './components';
import { useFileTheme } from '@/hooks/ui/useFileTheme';
import Image from 'next/image';

// GlobalDropZone 组件
export const GlobalDropZone = React.memo(({ onDrop }: { onDrop: (files: File[]) => void }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => onDrop(acceptedFiles),
        noClick: true,
        multiple: true,
    });

    const [state, dispatch] = React.useReducer(chatInputReducer, {
        message: '',
        isSending: false,
        isDragging: false,
        files: [],
    });

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            dispatch({ type: 'SET_DRAGGING', payload: true });
        };

        const handleDragLeave = (e: DragEvent) => {
            if (!e.relatedTarget) {
                dispatch({ type: 'SET_DRAGGING', payload: false });
            }
        };

        const handleDrop = () => {
            dispatch({ type: 'SET_DRAGGING', payload: false });
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

    return (
        <div {...getRootProps()} className={`
            fixed inset-0 z-50
            bg-white/50 dark:bg-black/50 backdrop-blur-sm
            transition-all duration-300 ease-in-out
            ${state.isDragging ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}
        `}>
            <input {...getInputProps()} />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                    flex flex-col items-center space-y-3
                    transition-transform duration-300 ease-in-out
                    ${state.isDragging ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
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
});

// FilePreview 组件
interface FilePreviewProps {
    files: File[];
    onRemove: (index: number) => void;
    uploadStatus?: Record<string, { progress: number; error?: string }>;
}

export const FilePreview: React.FC<FilePreviewProps> = memo(({ 
    files, 
    onRemove, 
    uploadStatus = {} 
}) => {
    const { getFileTheme, getFileTypeInfo, formatFileSize } = useFileTheme();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setShowLeftArrow(el.scrollLeft > 0);
        setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        el.addEventListener('scroll', checkScroll);
        const resizeObserver = new ResizeObserver(checkScroll);
        resizeObserver.observe(el);
        checkScroll();

        return () => {
            el.removeEventListener('scroll', checkScroll);
            resizeObserver.disconnect();
        };
    }, [checkScroll, files]);

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

            <div ref={scrollContainerRef} className="overflow-x-auto py-1 hide-scrollbar">
                <div className="inline-flex gap-3">
                    {files.map((file, index) => {
                        const theme = getFileTheme(file);
                        const fileType = getFileTypeInfo(file.name);
                        const status = uploadStatus[file.name];
                        const isUploading = status?.progress < 100;
                        const hasError = status?.error;
                        const isImage = file.type.startsWith('image/');

                        return (
                            <div key={index} className="group relative shrink-0">
                                <div className={`
                                    flex items-center gap-3 rounded-xl 
                                    bg-white dark:bg-gray-900
                                    border border-gray-100 dark:border-gray-800
                                    shadow-sm hover:shadow-md
                                    py-2 px-3
                                    transition-all duration-300
                                    ${hasError ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : ''}
                                `}>
                                    <div className="relative">
                                        {isImage ? (
                                            <div className={`
                                                w-10 h-10 rounded-lg overflow-hidden
                                                ${hasError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700/30'}
                                            `}>
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className={`
                                                        w-full h-full object-cover
                                                        ${isUploading ? 'opacity-50' : ''}
                                                    `}
                                                    width={48}
                                                    height={48}
                                                />
                                                {isUploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <SpinnerComponent size={14} className="text-current" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`
                                                w-10 h-10 rounded-lg 
                                                flex items-center justify-center
                                                transition-colors duration-300
                                                ${hasError ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-700/30'}
                                            `}>
                                                <theme.icon
                                                    size={20}
                                                    className={`
                                                        transition-opacity duration-300
                                                        ${hasError ? 'text-red-500' : ''}
                                                        ${isUploading ? 'opacity-0' : ''}
                                                    `}
                                                    style={{ color: !hasError ? theme.color : undefined }}
                                                />
                                                {isUploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <SpinnerComponent size={14} className="text-current" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col min-w-0 max-w-72 py-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {file.name.length > 25 ? `${file.name.slice(0, 25)}...` : file.name}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {formatFileSize(file.size)}
                                            </span>
                                            {status?.progress && status.progress < 100 && !hasError && (
                                                <FileProgressIndicator progress={status.progress} theme={theme} />
                                            )}
                                        </div>
                                        {hasError && (
                                            <span className="text-[11px] text-red-500 dark:text-red-400 mt-0.5 truncate">
                                                {status.error}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <RemoveButton 
                                    onClick={() => onRemove(index)}
                                    disabled={isUploading}
                                />
                            </div>
                        );
                    })}
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
    );
});

GlobalDropZone.displayName = 'GlobalDropZone';
FilePreview.displayName = 'FilePreview';
