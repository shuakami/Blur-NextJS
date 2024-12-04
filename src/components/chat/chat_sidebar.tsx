// src/components/chat/ChatSidebar.tsx
"use client";

import React, {useState, useEffect, useMemo, Suspense, useRef, memo, useCallback} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {SidebarItemType, SidebarItem} from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import {MessageCirclePlus, SidebarCloseIcon, Stars} from "lucide-react";
import useTranslation from '../../hooks/i18n/useTranslation';
import dayjs from 'dayjs';
import {cn} from '../../lib/utils/utils';
import dynamic from 'next/dynamic';
import { useShortcutManager } from '@/providers/ShortcutProvider';
import { SHORTCUT_DESCRIPTIONS, SHORTCUTS } from '@/constants/shortcuts';

const UserInfo = dynamic(() => import('./chat_sidebar/UserInfo'), {
  ssr: false,
  loading: () => <div className="h-16 bg-background/50" />
});
const LoadingDots = dynamic(() => import('@/components/ui/loading-dots').then(mod => mod.default), {
  ssr: false,
  loading: () => null
});

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
}

// 日期标签计算
const getDateLabel = (date: number): string => {
    const now = dayjs();
    const itemDate = dayjs(date);
    
    if (itemDate.isSame(now, 'day')) return '今天';
    if (itemDate.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
    if (itemDate.isSame(now.subtract(2, 'day'), 'day')) return '前天';
    if (itemDate.isAfter(now.startOf('week'))) return '这个星期';
    if (itemDate.isAfter(now.startOf('month'))) return '这个月';
    if (itemDate.isAfter(now.subtract(3, 'month'))) return '最近3个月';
    if (itemDate.isAfter(now.startOf('year'))) return '今年';
    return itemDate.format('YYYY 年');
};

const ANIMATION_CLASSES = {
    container: "transition-all duration-300 ease-out",
    item: "animate-slideInDown",
    fadeIn: "animate-fadeIn",
    stagger: "animate-stagger"
};

const ChatSidebar = memo<ChatSidebarProps>(({
    onUpdateConversations, 
    items, 
    user, 
    onClose, 
    onLoadMore, 
    hasMore, 
    loading
}) => {
    const {t} = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loadingRef, setLoadingRef] = useState<HTMLDivElement | null>(null);
    const shortcutManager = useShortcutManager()

    // 滚动监听
    useEffect(() => {
        if (!loadingRef || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(loadingRef);
        return () => observer.disconnect();
    }, [loadingRef, hasMore, loading, onLoadMore]);

    // 提取 conversationId 的逻辑
    const getConversationIdFromPath = useCallback((path: string) => {
        const parts = path.split('/');
        return parts[parts.length - 1] || null;
    }, []);

    // 根据路径更新选中状态
    useEffect(() => {
        if (!pathname) return;
        
        const conversationId = getConversationIdFromPath(pathname);
        if (conversationId !== selectedItem) {
            setSelectedItem(conversationId);
        }
    }, [pathname, selectedItem, getConversationIdFromPath]);

    // 选择对话
    const handleSelectItem = useCallback((id: string, href?: string) => {
        if (id !== selectedItem) {
            setSelectedItem(id);
        }
        if (href) {
            router.push(href as any);
        }
    }, [router, selectedItem]);
    
    // 新建对话
    const handleNewChat = useCallback(() => {
        router.push('/?new=true' as any);
    }, [router]);

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

        return Array.from(map.entries()).map(([label, children]) => ({
                label,
                children,
            }));
        }, [items]);

        // 对话列表
        const renderGroupItems = useMemo(() => (
            groupedItems.map((group, index) => (
                <div 
                    key={group.label} 
                    className={ANIMATION_CLASSES.container}
                    style={{ 
                        '--animation-delay': `${index * 0.1}s`
                    } as React.CSSProperties}
                >
                    <div className="text-black/60 dark:text-white/80 text-xs mx-6 my-2 animate-fadeIn">
                        {group.label}
                    </div>
                    <div>
                        {group.children.map((item) => (
                            <SidebarItemComponent
                                key={item.id}
                                item={item}
                                level={0}
                                selectedItem={selectedItem}
                                onSelect={() => handleSelectItem(item.id ?? '', item.href)}
                                onUpdateConversations={onUpdateConversations || (() => {})}
                            />
                        ))}
                    </div>
                </div>
            ))
        ), [groupedItems, selectedItem, handleSelectItem, onUpdateConversations]);

    const renderContent = useCallback(() => {
        // 有数据时显示列表
        if (items.length > 0) {
            return (
                <div className="space-y-2">
                    {renderGroupItems}
                    {(loading || hasMore) && (
                        <div 
                            ref={setLoadingRef} 
                            className="mt-4 mb-6 flex justify-center"
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

        // 加载中或无数据
        return (
            <div className="flex flex-col items-center justify-center h-[200px]">
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
    }, [items.length, loading, hasMore, renderGroupItems, loadingRef, t]);

    // 获取当前对话在列表中的索引
    const getCurrentIndex = useCallback(() => {
        const allConversations = groupedItems.flatMap(group => group.children)
        return allConversations.findIndex(item => item.id === selectedItem)
    }, [groupedItems, selectedItem])
    // 切换到上一个对话
    const gotoPrevChat = useCallback(() => {
        const allConversations = groupedItems.flatMap(group => group.children)
        const currentIndex = getCurrentIndex()
        
        if (currentIndex > 0) {
            const prevItem = allConversations[currentIndex - 1]
            handleSelectItem(prevItem.id ?? '', `/chat/${prevItem.id}`)
        }
    }, [groupedItems, getCurrentIndex, handleSelectItem])
    // 切换到下一个对话
    const gotoNextChat = useCallback(() => {
        const allConversations = groupedItems.flatMap(group => group.children)
        const currentIndex = getCurrentIndex()
        
        if (currentIndex < allConversations.length - 1) {
            const nextItem = allConversations[currentIndex + 1]
            handleSelectItem(nextItem.id ?? '', `/chat/${nextItem.id}`)
        }
    }, [groupedItems, getCurrentIndex, handleSelectItem])
    // 注册快捷键
    useEffect(() => {
        shortcutManager.register({
            command: 'PREV_CHAT',
            key: SHORTCUTS.PREV_CHAT,
            description: SHORTCUT_DESCRIPTIONS.PREV_CHAT,
            handler: gotoPrevChat,
            condition: () => document.activeElement?.tagName !== 'INPUT'
        })

        shortcutManager.register({
            command: 'NEXT_CHAT',
            key: SHORTCUTS.NEXT_CHAT,
            description: SHORTCUT_DESCRIPTIONS.NEXT_CHAT,
            handler: gotoNextChat,
            condition: () => document.activeElement?.tagName !== 'INPUT'
        })

        return () => {
            shortcutManager.unregister('PREV_CHAT')
            shortcutManager.unregister('NEXT_CHAT')
        }
    }, [shortcutManager, gotoPrevChat, gotoNextChat])

    return (
        <div className={cn(
            "flex flex-col h-screen w-[220px] bg-white dark:bg-gray-900 md:bg-[#F9F9F9]/95 md:dark:bg-[#171717]/95",
            "text-black dark:text-white"
        )}>
            <ScrollArea className="flex-grow" ref={scrollRef}>
                {/* 按钮区域 */}
                <div className="flex space-x-3 mt-[12px] w-44 justify-center items-center mx-4">
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 
                                 hover:bg-[#f0f0f0] dark:hover:bg-[#212121]"
                        onClick={onClose}
                    >
                        <SidebarCloseIcon size={20} />
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 
                                 hover:bg-[#f0f0f0] dark:hover:bg-[#212121]"
                        onClick={handleNewChat}
                    >
                        <MessageCirclePlus size={20} />
                    </Button>
                </div>

                {/* 对话列表区域 */}
                <div className="py-4 mt-2 relative">
                    {renderContent()}
                </div>
            </ScrollArea>

            {/* 用户信息区域 */}
            <UserInfo 
                avatarUrl={user.avatarUrl} 
                name={user.name} 
                status={user.status} 
            />
        </div>
    );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
