"use client"

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Brain, Trash2, Clock, Archive, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils/utils';
import { Spinner } from '../spinner';

interface Memory {
    id: string;
    content: string;
    timestamp: number;
    type: 'long_term' | 'short_term';
    tags?: string[];
}

interface MemoryManagerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface MemoryManagerState {
    page: number;
    pageSize: number;
    loading: boolean;
    error: Error | null;
}

export function MemoryManagerDialog({ open, onOpenChange }: MemoryManagerDialogProps) {
    const [state, setState] = useState<MemoryManagerState>({
        page: 1,
        pageSize: 20,
        loading: false,
        error: null
    });

    const [activeType, setActiveType] = useState<'all' | 'long_term' | 'short_term'>('all');

    // 临时数据
    const memories: Memory[] = [

    ];

    const handleDelete = (id: string) => {
        // 删除记忆的逻辑
    };

    // 使用 useMemo 缓存过滤后的记忆
    const filteredMemories = useMemo(() => 
        memories.filter(m => activeType === 'all' || m.type === activeType)
    , [memories, activeType]);

    // 分页加载记忆
    const paginatedMemories = useMemo(() => {
        const start = (state.page - 1) * state.pageSize;
        return filteredMemories.slice(start, start + state.pageSize);
    }, [filteredMemories, state.page, state.pageSize]);



    // 优化滚动加载
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop === clientHeight) {
            setState(prev => ({ ...prev, page: prev.page + 1 }));
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showClose={false} className="max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-neutral-900 shadow-lg">
                {/* 头部 */}
                <DialogHeader className="relative p-3 pb-2.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5">
                            <Brain className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">记忆管理</span>
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-2 -top-0 rounded-full p-1
                                 hover:bg-neutral-100 dark:hover:bg-neutral-800
                                 text-neutral-400 hover:text-neutral-600
                                 dark:text-neutral-400 dark:hover:text-neutral-300
                                 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

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

                {/* 优化内容区域 */}
                <div 
                    className="relative px-3 pb-3 bg-white dark:bg-neutral-900"
                    onScroll={handleScroll}
                >
                    <div className="min-h-[300px] max-h-[45vh] overflow-y-auto">
                        {state.loading && <Spinner />}
                        
                        <div className="space-y-2 transition-all duration-300">
                            {paginatedMemories.length > 0 ? (
                                paginatedMemories.map((memory) => (
                                    <MemoryItem 
                                        key={memory.id}
                                        memory={memory}
                                        onDelete={() => handleDelete(memory.id)}
                                    />
                                ))
                            ) : (
                                // 空状态展示
                                <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-800 
                                                  flex items-center justify-center mb-3">
                                        <Brain className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        暂无记忆
                                    </p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                        随着对话的进行，AI 会在此积累相关记忆
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const MemoryItem = memo(({ memory, onDelete }: { 
    memory: Memory, 
    onDelete: () => void 
}) => {
    return (
        <div className="group relative p-2.5 rounded-lg animate-fadeIn bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-sm hover:shadow transition-all duration-200">
            <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {memory.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <time className="text-[10px] text-neutral-400">
                            {new Date(memory.timestamp).toLocaleString()}
                        </time>
                        {memory.tags && (
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

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-50 dark:bg-neutral-800 transition-all duration-200 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 h-6 w-6"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}); 