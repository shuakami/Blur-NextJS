"use client"

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Brain, Trash2, Clock, Archive, X, Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils/utils';
import { Spinner } from '../spinner';
import { useMemory, Memory, MemoryFilter } from '@/hooks/useMemory';
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/hooks/useDebounce';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmModal from '../tofu/confirm-modal';

interface MemoryManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MemoryManagerDialog({ open, onOpenChange }: MemoryManagerDialogProps) {
    // 状态管理
    const [activeType, setActiveType] = useState<'all' | 'long_term' | 'short_term'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 300);
    const pageSize = 20;

    // 构建滤器
    const filter: MemoryFilter = useMemo(() => ({
        type: activeType,
        search: debouncedSearch,
        page: currentPage,
        pageSize
    }), [activeType, debouncedSearch, currentPage]);

    // 使用 hook
    const {
        memories,
        total,
        isLoading,
        error,
        pagination,
        deleteMemory,
        preloadNextPage,
        refetch
    } = useMemory({ 
        filter,
        enabled: open,
    });

    // 重置页码
    useEffect(() => {
        setCurrentPage(1);
    }, [activeType, debouncedSearch]);

    // 模态框打开时刷新数据
    useEffect(() => {
        if (open) {
            refetch();
        }
    }, [open, refetch]);

    // 预加载下一页
    useEffect(() => {
        if (pagination.hasNextPage) {
            preloadNextPage();
        }
    }, [currentPage, pagination.hasNextPage, preloadNextPage]);

    // 处理滚动加载
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !isLoading && pagination.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    }, [isLoading, pagination.hasNextPage]);

    // 处理删除
    const handleDelete = useCallback(async (id: string) => {
        setMemoryToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    // 确认删除
    const confirmDelete = useCallback(async () => {
        if (!memoryToDelete) return;
        try {
            setIsDeleting(true);
            await deleteMemory(memoryToDelete);
            setDeleteDialogOpen(false);
            setMemoryToDelete(null);
        } catch (error) {
            console.error('删除失败:', error);
        } finally {
            setIsDeleting(false);
        }
    }, [memoryToDelete, deleteMemory]);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent showClose={false} className="max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-neutral-900 shadow-lg">
                    {/* 头部 */}
                    <DialogHeader className="relative p-3 pb-2.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5">
                                    <Brain className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                                </div>
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">记忆管理</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="rounded-full p-1
                                         hover:bg-neutral-100 dark:hover:bg-neutral-800
                                         text-neutral-400 hover:text-neutral-600
                                         dark:text-neutral-400 dark:hover:text-neutral-300
                                         transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    {/* 搜索框 */}
                    <div className="px-3 pt-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="搜索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 h-8 text-xs bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                            />
                        </div>
                    </div>

                    {/* 分类切换 */}
                    <div className="px-3 py-2.5 bg-white dark:bg-neutral-900">
                        <div className="relative flex rounded-lg overflow-hidden
                                    bg-neutral-100 dark:bg-neutral-800/50
                                    ring-1 ring-neutral-200/80 dark:ring-neutral-700/80">
                            {/* 滑块背景 */}
                            <div
                                className={cn(
                                    "absolute inset-0 w-1/3 transition-all duration-300 ease-spring",
                                    "bg-white dark:bg-neutral-700 rounded-lg",
                                    "shadow-[0_2px_4px_rgba(0,0,0,0.02)]",
                                    "dark:shadow-[0_2px_4px_rgba(0,0,0,0.1)]",
                                    {
                                        "translate-x-0": activeType === "all",
                                        "translate-x-full": activeType === "long_term",
                                        "translate-x-[200%]": activeType === "short_term",
                                    }
                                )}
                            />
                            {([
                                { type: 'all', icon: Brain, label: '全部' },
                                { type: 'long_term', icon: Archive, label: '长期记忆' },
                                { type: 'short_term', icon: Clock, label: '短期记忆' }
                            ] as const).map(({ type, icon: Icon, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(type)}
                                    className={cn(
                                        "relative flex-1 flex items-center justify-center gap-2 rounded-lg",
                                        "py-2 px-3 text-xs",
                                        "transition-all duration-300 ease-spring",
                                        "hover:text-neutral-900 dark:hover:text-neutral-100",
                                        activeType === type ? [
                                            "text-neutral-900 dark:text-neutral-100",
                                        ] : [
                                            "text-neutral-500 dark:text-neutral-400",
                                        ]
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-3.5 h-3.5 transition-colors duration-300",
                                        activeType === type
                                            ? "text-neutral-600 dark:text-neutral-300"
                                            : "text-neutral-400 dark:text-neutral-500"
                                    )} />
                                    <span className="font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 内容区域 */}
                    <div 
                        className="relative px-3 pb-3 bg-white dark:bg-neutral-900"
                        onScroll={handleScroll}
                    >
                        <div className="min-h-[300px] max-h-[45vh] overflow-y-auto">
                            {/* 加载状态 */}
                            {isLoading && !memories.length && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                                    <Spinner className="w-8 h-8" />
                                </div>
                            )}
                            
                            {/* 错误状态 */}
                            {error && (
                                <div className="text-center p-4 text-red-500">
                                    加载失败: {(error as Error).message}
                                </div>
                            )}
                            
                            {/* 记忆列表 */}
                            <div className="transition-all duration-300">
                                <AnimatePresence mode="wait">
                                    {memories && memories.length > 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {memories.map((memory, index) => (
                                                <motion.div
                                                    key={memory.id || index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ 
                                                        duration: 0.3,
                                                        delay: index * 0.05,
                                                        ease: [0.23, 1, 0.32, 1]
                                                    }}
                                                >
                                                    <MemoryItem 
                                                        memory={memory}
                                                        onDelete={() => memory.id && handleDelete(memory.id)}
                                                    />
                                                </motion.div>
                                            ))}
                                            {/* 加载更多指示器 */}
                                            {isLoading && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex justify-center py-2"
                                                >
                                                    <Spinner className="w-6 h-6" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : !isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ 
                                                duration: 0.2,
                                                ease: [0.23, 1, 0.32, 1]
                                            }}
                                            className="flex flex-col items-center justify-center min-h-[200px] text-center p-4"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 
                                                          flex items-center justify-center mb-3">
                                                {searchTerm ? (
                                                    <Search className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                                ) : (
                                                    <Brain className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                                )}
                                            </div>
                                            {searchTerm ? (
                                                <>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        未找到相关记忆
                                                    </p>
                                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                                        尝试使用其他关键词搜索
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        暂无记忆
                                                    </p>
                                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                                        随着对话的进行，AI 会在此积累相关记忆
                                                    </p>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认对话框 */}
            <ConfirmModal
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="删除记忆"
                message="此操作将永久删除该记忆，且无法恢复。是否确认继续？"
                type="danger"
                confirmText="删除"
                isLoading={isDeleting}
            />
        </>
    );
}

const MemoryItem = memo(({ memory, onDelete }: { 
    memory: Memory, 
    onDelete: () => void 
}) => {
    return (
        <div className="group relative mt-2 p-2.5 rounded-lg animate-fadeIn
                      bg-white dark:bg-neutral-800 
                      border border-neutral-200 dark:border-neutral-700 
                      hover:border-neutral-300 dark:hover:border-neutral-600 
                      shadow-sm hover:shadow transition-all duration-200">
            <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {memory.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <time className="text-[10px] text-neutral-400">
                            {new Date(memory.timestamp).toLocaleString()}
                        </time>
                        {memory.tags && memory.tags.length > 0 && (
                            <div className="flex gap-1.5">
                                {memory.tags.map((tag, i) => (
                                    <span key={i} 
                                        className="px-1.5 h-4 inline-flex items-center
                                                 text-[10px] rounded
                                                 bg-neutral-50 dark:bg-neutral-700
                                                 text-neutral-500 dark:text-neutral-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {memory.id && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                                 bg-neutral-50 dark:bg-neutral-800 
                                 transition-all duration-200 
                                 text-neutral-400 hover:text-red-500 
                                 hover:bg-red-50 dark:hover:bg-red-500/10 
                                 h-6 w-6"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
});

MemoryItem.displayName = 'MemoryItem'; 