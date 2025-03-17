import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface PageMessage {
    messageId: string;
    preview: string;
    timestamp: number;
    role: string;
}

interface MessagePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageMessages?: PageMessage[];
}

const MessagePagination = memo(({ currentPage, totalPages, onPageChange, pageMessages }: MessagePaginationProps) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // 第一页
                i === totalPages || // 最后一页
                (i >= currentPage - 1 && i <= currentPage + 1) // 当前页的前后一页
            ) {
                const pageMessage = pageMessages?.[i - 1];
                const tooltipContent = pageMessage 
                    ? `${pageMessage.role === 'user' ? '用户' : '助手'}: ${pageMessage.preview}`
                    : `第 ${i} 页`;

                pages.push(
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPageChange(i)}
                        className={`group relative w-8 h-8 rounded-full flex items-center justify-center text-sm
                            ${currentPage === i 
                                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {i}
                        {/* 悬浮提示 */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block">
                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs">
                                {tooltipContent}
                            </div>
                            <div className="w-2 h-2 bg-gray-800 transform rotate-45 translate-x-1/2 translate-y-1/2 mx-auto">
                            </div>
                        </div>
                    </motion.button>
                );
            } else if (
                (i === currentPage - 2 && currentPage > 3) ||
                (i === currentPage + 2 && currentPage < totalPages - 2)
            ) {
                pages.push(
                    <span key={i} className="text-gray-400 dark:text-gray-600">...</span>
                );
            }
        }
        return pages;
    };

    // 获取当前页的消息预览
    const currentPreview = pageMessages?.[currentPage - 1];
    
    return (
        <div className="flex flex-col items-center gap-2 py-2">
            {/* 当前页消息预览 */}
            {currentPreview && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {currentPreview.role === 'user' ? '用户' : '助手'}: {currentPreview.preview}
                </div>
            )}
            
            {/* 分页控制 */}
            <div className="flex items-center justify-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${currentPage === 1 
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    ←
                </motion.button>
                {renderPageNumbers()}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${currentPage === totalPages 
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    →
                </motion.button>
            </div>
        </div>
    );
});

MessagePagination.displayName = 'MessagePagination';

export default MessagePagination; 