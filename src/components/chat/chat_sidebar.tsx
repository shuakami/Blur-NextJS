"use client";

import React, { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { SidebarItemType, SidebarItem } from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import { MessageCirclePlus, SidebarCloseIcon, Stars, BookText, ListTodo, ChevronRight, MessageCircle, Puzzle } from "lucide-react";
import useTranslation from '../../hooks/i18n/useTranslation';
import dayjs from 'dayjs';
import { cn } from '../../lib/utils/utils';
import { useShortcutManager } from '@/providers/ShortcutProvider';
import { SHORTCUT_DESCRIPTIONS, SHORTCUTS } from '@/constants/shortcuts';
import { useConversationContext } from '@/app/[上下文]/contexts';
import { Route } from 'next';
import LoadingDots from '@/components/ui/loading-dots';
import UserInfo from './chat_sidebar/UserInfo';
import { StreamMessageHandler } from '@/app/[上下文]/core/StreamMessageHandler';
import Link from 'next/link';
import BookItemComponent from './chat_sidebar/BookItemComponent';

// 常量定义
const SCROLL_THRESHOLD = 0.5;

// 类型定义
interface ChatSidebarProps {
    items: SidebarItemType[];
    user: {
        avatarUrl: string;
        name: string;
        status: string;
    };
    onClose: () => void;
    onUpdateConversations?: () => void;
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    streamHandler?: React.MutableRefObject<StreamMessageHandler>;
    mode?: 'chat' | 'book';
    onCreateNew?: () => Promise<void>;
    selectedItem: string | null;
    onSelect: (id: string) => void;
    isCreating?: boolean;
}

// 日期标签计算
const dateCache = new Map<number, string>();
const getDateLabel = (date: number): string => {
    const cached = dateCache.get(date);
    if (cached) return cached;

    const now = dayjs();
    const itemDate = dayjs(date);
    
    let label = '';
    if (itemDate.isSame(now, 'day')) label = '今天';
    else if (itemDate.isSame(now.subtract(1, 'day'), 'day')) label = '昨天';
    else if (itemDate.isSame(now.subtract(2, 'day'), 'day')) label = '前天';
    else if (itemDate.isAfter(now.startOf('week'))) label = '这个星期';
    else if (itemDate.isAfter(now.startOf('month'))) label = '这个月';
    else if (itemDate.isAfter(now.subtract(3, 'month'))) label = '最近3个月';
    else if (itemDate.isAfter(now.startOf('year'))) label = '今年';
    else label = itemDate.format('YYYY 年');
    
    dateCache.set(date, label);
    return label;
};

const ChatSidebar = memo<ChatSidebarProps>(({
    onUpdateConversations, 
    items, 
    user, 
    onClose, 
    onLoadMore, 
    hasMore, 
    loading,
    streamHandler,
    mode = 'chat',
    onCreateNew,
    selectedItem,
    onSelect,
    isCreating = false
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const shortcutManager = useShortcutManager();

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // 状态
    const [flattenedItems, setFlattenedItems] = useState<SidebarItem[]>([]);
    const [showLoading, setShowLoading] = useState(false);

    // 延迟显示loading状态
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => {
                setShowLoading(true);
            }, 300);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    // 分组逻辑
    const groupedItems = useMemo(() => {
        const map = new Map<string, SidebarItem[]>();
        
        items.forEach((item) => {
            if ('date' in item) {
                const dateLabel = getDateLabel(item.date);
                const existingItems = map.get(dateLabel) || [];
                map.set(dateLabel, existingItems.concat(item.children || []));
            }
        });

        const result = Array.from(map.entries()).map(([label, children]) => ({
            label,
            children,
        }));

        // 更新扁平化列表
        setFlattenedItems(result.flatMap(group => group.children));
        
        return result;
    }, [items]);

    // 滚动监听
    useEffect(() => {
        if (!loadingRef.current || !hasMore || loading) return;

        observerRef.current?.disconnect();
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(onLoadMore);
                }
            },
            { threshold: SCROLL_THRESHOLD }
        );

        observerRef.current.observe(loadingRef.current);
        return () => observerRef.current?.disconnect();
    }, [hasMore, loading, onLoadMore]);

    // 对话切换
    const handleSelectItem = useCallback((id: string) => {
        if (id === selectedItem) return;
        onSelect(id);
    }, [selectedItem, onSelect]);

    // 新建操作
    const handleNew = useCallback(() => {
        if (mode === 'book' && onCreateNew) {
            onCreateNew();
        } else {
            router.push('/?new=true' as Route);
        }
    }, [router, mode, onCreateNew]);

    // 对话导航
    const getCurrentIndex = useCallback(() => (
        flattenedItems.findIndex(item => item.id === selectedItem)
    ), [flattenedItems, selectedItem]);

    const gotoPrevChat = useCallback(() => {
        const currentIndex = getCurrentIndex();
        if (currentIndex > 0) {
            const prevItem = flattenedItems[currentIndex - 1];
            handleSelectItem(prevItem.id ?? '');
        }
    }, [getCurrentIndex, flattenedItems, handleSelectItem]);

    const gotoNextChat = useCallback(() => {
        const currentIndex = getCurrentIndex();
        if (currentIndex < flattenedItems.length - 1) {
            const nextItem = flattenedItems[currentIndex + 1];
            handleSelectItem(nextItem.id ?? '');
        }
    }, [getCurrentIndex, flattenedItems, handleSelectItem]);

    // 快捷键注册
    useEffect(() => {
        const condition = () => document.activeElement?.tagName !== 'INPUT';
        
        shortcutManager.register({
            command: 'PREV_CHAT',
            key: SHORTCUTS.PREV_CHAT,
            description: SHORTCUT_DESCRIPTIONS.PREV_CHAT,
            handler: gotoPrevChat,
            condition
        });

        shortcutManager.register({
            command: 'NEXT_CHAT',
            key: SHORTCUTS.NEXT_CHAT,
            description: SHORTCUT_DESCRIPTIONS.NEXT_CHAT,
            handler: gotoNextChat,
            condition
        });

        return () => {
            shortcutManager.unregister('PREV_CHAT');
            shortcutManager.unregister('NEXT_CHAT');
        };
    }, [shortcutManager, gotoPrevChat, gotoNextChat]);

    // 渲染列表项
    const renderGroupItems = useMemo(() => (
        groupedItems.map((group) => (
            <div key={group.label}>
                <div className="sticky top-0 z-10 flex h-8 items-center bg-gray-50/95 dark:bg-gray-945/95 backdrop-blur-sm text-black/60 dark:text-white/80 text-xs px-5 ">
                    {group.label}
                </div>
                <div className="mt-1">
                    {mode === 'book' ? (
                        group.children.map((item) => (
                            <BookItemComponent
                                key={item.id}
                                item={item}
                                level={0}
                                selectedItem={selectedItem}
                                onSelect={handleSelectItem}
                                onUpdateBooks={onUpdateConversations || (() => {})}
                            />
                        ))
                    ) : (
                        group.children.map((item) => (
                            <SidebarItemComponent
                                key={item.id}
                                item={item}
                                level={0}
                                selectedItem={selectedItem}
                                onSelect={handleSelectItem}
                                onUpdateConversations={onUpdateConversations || (() => {})}
                                streamHandler={streamHandler}
                            />
                        ))
                    )}
                </div>
            </div>
        ))
    ), [groupedItems, selectedItem, handleSelectItem, onUpdateConversations]);

    // 渲染内容
    const renderContent = useCallback(() => {
        if (items.length > 0) {
            return (
                <div>
                    {renderGroupItems}
                    {(hasMore || loading) && (
                        <div 
                            ref={loadingRef} 
                            className={cn(
                                "mt-4 mb-6 flex justify-center",
                                "transition-opacity duration-300",
                                showLoading ? "opacity-100" : "opacity-0"
                            )}
                        >
                            {loading ? (
                                <LoadingDots size="md" />
                            ) : (
                                <div className="text-xs text-black/50 dark:text-white/50">
                                    {t('继续浏览')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={cn(
                "flex flex-col items-center justify-center h-[200px]",
                "transition-opacity duration-300",
                showLoading ? "opacity-100" : "opacity-0"
            )}>
                {loading ? (
                    <LoadingDots size="sm" />
                ) : (
                    <div className="flex flex-col items-center gap-4 px-4">
                        <Stars size={24} className="text-black/40 dark:text-white/40" />
                        <div className="text-center">
                            <p className="text-sm text-black/50 dark:text-white/50">
                                {t('没有对话')}
                            </p>
                            <p className="text-xs text-black/30 dark:text-white/30 mt-1">
                                {t('点击右上角按钮开始新对话')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }, [items.length, loading, hasMore, renderGroupItems, t, showLoading]);

    return (
        <aside className={cn(
            "flex flex-col h-screen bg-gray-50 dark:bg-gray-945",
            "w-[260px] text-foreground"
        )}>
            {/* 按钮区域 */}
            <header className="flex items-center justify-between px-3.5 py-3 mt-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <SidebarCloseIcon size={20} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNew}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {mode === 'book' ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <MessageCirclePlus size={20} />
                    )}
                </Button>
            </header>

            {/* 对话列表区域 */}
            <main className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto sidebar-scroll">
                    {/* 功能导航列表 */}
                    <nav className="px-3 pt-1" aria-label="主导航">
                        <ul className="flex flex-col gap-1" role="list">
                            <li>
                                <Link href={'/?new=true' as Route} className="w-full">
                                    <div className="flex items-center justify-between rounded-md py-2 px-2 transition-colors duration-200 w-full text-black dark:text-white hover:bg-[#f0f0f0]/75 dark:hover:bg-[#1e1e1e]/75 group">
                                        <div className="flex items-center">
                                            <MessageCircle size={18} />
                                            <span className="text-sm ml-3">聊天</span>
                                        </div>
                                        <ChevronRight 
                                            size={16} 
                                            className="opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" 
                                        />
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link href={'/book' as Route} className="w-full">
                                    <div className="flex items-center justify-between rounded-md py-2 px-2 transition-colors duration-200 w-full text-black dark:text-white hover:bg-[#f0f0f0]/75 dark:hover:bg-[#1e1e1e]/75 group">
                                        <div className="flex items-center">
                                            <BookText size={18} />
                                            <span className="text-sm ml-3">笔记</span>
                                        </div>
                                        <ChevronRight 
                                            size={16} 
                                            className="opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" 
                                        />
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link href={'/task' as Route} className="w-full">
                                    <div className="flex items-center justify-between rounded-md py-2 px-2 transition-colors duration-200 w-full text-black dark:text-white hover:bg-[#f0f0f0]/75 dark:hover:bg-[#1e1e1e]/75 group">
                                        <div className="flex items-center">
                                            <ListTodo size={18} />
                                            <span className="text-sm ml-3">任务</span>
                                        </div>
                                        <ChevronRight 
                                            size={16} 
                                            className="opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" 
                                        />
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <Link href={'/plugin' as Route} className="w-full">
                                    <div className="flex items-center justify-between rounded-md py-2 px-2 transition-colors duration-200 w-full text-black dark:text-white hover:bg-[#f0f0f0]/75 dark:hover:bg-[#1e1e1e]/75 group">
                                        <div className="flex items-center">
                                            <Puzzle size={18} />
                                            <span className="text-sm ml-3">插件中心</span>
                                        </div>
                                        <ChevronRight 
                                            size={16} 
                                            className="opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" 
                                        />
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <section className="py-2" aria-label="对话列表">
                        {mode === 'book' ? (
                            <div>
                                {groupedItems.map((group) => (
                                    <div key={group.label}>
                                        <div className="sticky top-0 z-10 flex h-8 items-center bg-gray-50/95 dark:bg-gray-945/95 backdrop-blur-sm text-black/60 dark:text-white/80 text-xs px-5 ">
                                            {group.label}
                                        </div>
                                        <div className="mt-1">
                                            {group.children.map((item) => (
                                                <BookItemComponent
                                                    key={item.id}
                                                    item={item}
                                                    level={0}
                                                    selectedItem={selectedItem}
                                                    onSelect={handleSelectItem}
                                                    onUpdateBooks={onUpdateConversations || (() => {})}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {(hasMore || loading) && (
                                    <div 
                                        ref={loadingRef} 
                                        className={cn(
                                            "mt-4 mb-6 flex justify-center",
                                            "transition-opacity duration-300",
                                            showLoading ? "opacity-100" : "opacity-0"
                                        )}
                                    >
                                        {loading ? (
                                            <LoadingDots size="md" />
                                        ) : (
                                            <div className="text-xs text-black/50 dark:text-white/50">
                                                {t('继续浏览')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </section>
                </div>
            </main>

            {/* 用户信息区域 */}
            <footer>
                <UserInfo 
                    avatarUrl={user.avatarUrl} 
                    name={user.name} 
                    status={user.status} 
                />
            </footer>
        </aside>
    );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;