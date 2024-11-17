// src/components/chat/ChatSidebar.tsx
"use client";

import React, {useState, useEffect, useMemo, Suspense, lazy, useRef} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {SidebarItemType, SidebarItem} from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import {MessageCirclePlus, SidebarCloseIcon, Stars} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";
import dayjs from 'dayjs';
import {cn} from '@/lib/utils';
import { motion } from 'framer-motion';
import { LoadingDots } from '@/components/ui/loading-dots';

// 懒加载用户信息组件
const UserInfo = lazy(() => import('./chat_sidebar/UserInfo'));

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

const ChatSidebar: React.FC<ChatSidebarProps> = ({
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
    const [isVisible, setIsVisible] = useState(false);

    // 添加滚动监听
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loadingRef, setLoadingRef] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!loadingRef) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    onLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(loadingRef);
        return () => observer.disconnect();
    }, [loadingRef, hasMore, loading, onLoadMore]);

    // 处理对话选择
    const handleSelectItem = (id: string, href?: string) => {
        setSelectedItem(id);
        if (href) router.push(href);
    };

    // 根据 URL 更新 selectedItem
    useEffect(() => {
        if (!pathname) return;
        const pathParts = pathname.split('/');
        const conversationId = pathParts[pathParts.length - 1];
        setSelectedItem(conversationId || null);
    }, [pathname]);

    // 入场动画
    useEffect(() => {
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);

    const handleNewChat = () => {
        router.push('/?new=true');
    };

    // 分组逻辑
    const groupedItems = useMemo(() => {
        const map = new Map<string, SidebarItem[]>();
        const now = dayjs();
        const dateLabelSet = new Set<string>();

        items.forEach((item) => {
            if ('date' in item) {
                const dateLabel = dayjs(item.date).isSame(now, 'day') ? '今天' :
                    dayjs(item.date).isSame(now.subtract(1, 'day'), 'day') ? '昨天' :
                    dayjs(item.date).isSame(now.subtract(2, 'day'), 'day') ? '前天' :
                    dayjs(item.date).isAfter(now.startOf('week')) ? '这个星期' :
                    dayjs(item.date).isAfter(now.startOf('month')) ? '这个月' :
                    dayjs(item.date).isAfter(now.subtract(3, 'month')) ? '最近3个月' :
                    dayjs(item.date).isAfter(now.startOf('year')) ? '今年' :
                    dayjs(item.date).format('YYYY 年');

                if (!dateLabelSet.has(dateLabel)) {
                    dateLabelSet.add(dateLabel);
                    map.set(dateLabel, item.children || []);
                } else {
                    const existingChildren = map.get(dateLabel) || [];
                    map.set(dateLabel, existingChildren.concat(item.children || []));
                }
            }
        });

        return Array.from(map.entries()).map(([dateLabel, children]) => ({
            label: dateLabel,
            children,
        }));
    }, [items]);

    // 修改动画配置
    const itemVariants = {
        hidden: { 
            opacity: 0,
            y: 20
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3,
                ease: "easeOut"
            }
        })
    };

    // 侧边栏列表渲染
    const renderGroupItems = useMemo(() => (
        groupedItems.map((group, groupIndex) => (
            <motion.div 
                key={group.label}
                initial="hidden"
                animate="visible"
                custom={groupIndex}
                variants={itemVariants}
            >
                <div className="text-black/60 dark:text-white/80 text-xs mx-6 my-2">
                    <span>{group.label}</span>
                </div>
                <div>
                    {group.children.map((subItem) => (
                        <SidebarItemComponent
                            key={subItem.id}
                            item={subItem}
                            level={0}
                            selectedItem={selectedItem}
                            onSelect={() => handleSelectItem(subItem.id ?? '', subItem.href)}
                            onUpdateConversations={onUpdateConversations || (() => {})}
                        />
                    ))}
                </div>
            </motion.div>
        ))
    ), [groupedItems, selectedItem, handleSelectItem, onUpdateConversations, itemVariants]);

    return (
        <div
            className={cn(
                "flex flex-col h-screen w-[220px] bg-[#F9F9F9]/95 dark:bg-[#171717]/95 text-black dark:text-white",
                "transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0"
            )}
        >
            <ScrollArea className="flex-grow" ref={scrollRef}>
                {/* 按钮区域 */}
                <div className="flex space-x-3 mt-[12px] w-44 justify-center items-center mx-4">
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={onClose}
                    >
                        <SidebarCloseIcon size={20} className="text-black dark:text-white"/>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={handleNewChat}
                    >
                        <MessageCirclePlus size={20} className="text-black dark:text-white"/>
                    </Button>
                </div>

                {/* 对话列表区域 */}
                <div className="py-4 mt-2 relative">
                    {isVisible && groupedItems.length > 0 ? (
                        <div className="space-y-2">
                            {renderGroupItems}
                            
                            {/* 加载区域 - 只在loading或hasMore时显示 */}
                            {(loading || hasMore) && (
                                <div className={cn(
                                    "mt-4 mb-6",
                                    loading ? "h-20" : "h-12" // 加载时更高，否则只保持箭头的高度
                                )}>
                                    <motion.div 
                                        ref={setLoadingRef}
                                        className="flex flex-col items-center justify-center h-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {loading ? (
                                            <LoadingDots size="md" showText={true} />
                                        ) : hasMore && (
                                            <div className="flex flex-col items-center gap-2">
                                                {/* 脉冲箭头动画 */}
                                                <motion.div 
                                                    className="text-primary/60 dark:text-primary/50"
                                                    animate={{ 
                                                        y: [0, 4, 0],
                                                        scale: [1, 1.1, 1],
                                                        opacity: [0.6, 1, 0.6]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path 
                                                            d="M12 5v14M5 12l7 7 7-7" 
                                                            strokeWidth="2" 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </motion.div>
                                                <span className="text-xs text-black/50 dark:text-white/50">
                                                    {t('继续浏览')}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.div 
                        className="flex flex-col items-center justify-center h-[200px] px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loading ? (
                            <LoadingDots size="sm" showText={true} />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                    <Stars 
                                        size={24} 
                                        className="text-black/40 dark:text-white/40"
                                    />
                                </div>
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
                    </motion.div>
                    )}
                </div>
            </ScrollArea>

            {/* 用户信息区域 - 懒加载 */}
            <Suspense fallback={<div className="h-16 bg-background animate-pulse rounded-md" />}>
                <UserInfo 
                    avatarUrl={user.avatarUrl} 
                    name={user.name} 
                    status={user.status} 
                />
            </Suspense>
        </div>
    );
};

export default ChatSidebar;
