"use client";

import React, { useState, useEffect, useMemo, useRef, memo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { SidebarItemType, SidebarItem } from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import { MessageCirclePlus, SidebarCloseIcon, Stars } from "lucide-react";
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
    streamHandler
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const { newConversationId } = useConversationContext();
    const shortcutManager = useShortcutManager();

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isRoutingRef = useRef(false);

    // 状态
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
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

    // 路径监听
    useEffect(() => {
        if (isRoutingRef.current) return;

        if (newConversationId && newConversationId !== selectedItem) {
            setSelectedItem(newConversationId);
            return;
        }

        if (pathname) {
            const conversationId = pathname.split('/').pop();
            if (conversationId && conversationId !== selectedItem) {
                setSelectedItem(conversationId);
            }
        }
    }, [pathname, selectedItem, newConversationId]);

    // 对话切换
    const handleSelectItem = useCallback((id: string) => {
        if (id === selectedItem || isRoutingRef.current) return;
        
        isRoutingRef.current = true;
        setSelectedItem(id);
        
        requestAnimationFrame(() => {
            router.push(`/chat/${id}` as Route, { scroll: false });
            isRoutingRef.current = false;
        });
    }, [router, selectedItem]);

    // 新建对话
    const handleNewChat = useCallback(() => {
        router.push('/?new=true' as Route);
    }, [router]);

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
                <div className="text-black/60 dark:text-white/80 text-xs mx-5 my-2 mt-6">
                    {group.label}
                </div>
                <div>
                    {group.children.map((item) => (
                        <SidebarItemComponent
                            key={item.id}
                            item={item}
                            level={0}
                            selectedItem={selectedItem}
                            onSelect={handleSelectItem}
                            onUpdateConversations={onUpdateConversations || (() => {})}
                            streamHandler={streamHandler}
                        />
                    ))}
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
        <div className={cn(
            "flex flex-col h-screen bg-gray-50 dark:bg-gray-945",
            "w-[260px] text-foreground"
        )}>
            {/* 按钮区域 */}
            <div className="flex items-center justify-between px-4 py-3 mt-0.5">
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
                    onClick={handleNewChat}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <MessageCirclePlus size={20} />
                </Button>
            </div>

            {/* 对话列表区域 */}
            <div className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto sidebar-scroll">
                    <div className="py-2">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* 用户信息区域 */}
            <div>
                <UserInfo 
                    avatarUrl={user.avatarUrl} 
                    name={user.name} 
                    status={user.status} 
                />
            </div>
        </div>
    );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;