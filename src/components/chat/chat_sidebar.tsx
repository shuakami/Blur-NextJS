// src/components/chat/ChatSidebar.tsx
"use client";

import React, {useState, useEffect, useMemo, Suspense, lazy} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {SidebarItemType, SidebarItem} from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import {MessageCirclePlus, SidebarCloseIcon} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";
import dayjs from 'dayjs';
import {cn} from '@/lib/utils';
import { motion } from 'framer-motion';

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
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    onUpdateConversations, 
    items, 
    user, 
    onClose
}) => {
    const {t} = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

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
        router.push('/');
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

    // 动画配置
    const itemVariants = useMemo(() => ({
        hidden: { 
            opacity: 0,
            height: 0,
        },
        visible: (i: number) => ({
            opacity: 1,
            height: "auto",
            transition: {
                height: {
                    duration: 0.4,
                    ease: [0.33, 1, 0.68, 1]
                },
                opacity: {
                    duration: 0.3,
                    delay: i * 0.03
                }
            }
        }),
        exit: { 
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    }), []);

    // 侧边栏列表渲染
    const renderGroupItems = useMemo(() => (
        groupedItems.map((group) => (
            <div key={group.label}>
                <div className="text-black/60 dark:text-white/80 text-xs mx-6 my-2">
                    <span>{group.label}</span>
                </div>
                <div className="overflow-hidden">
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
            </div>
        ))
    ), [groupedItems, selectedItem, handleSelectItem, onUpdateConversations]);

    return (
        <div
            className={cn(
                "flex flex-col h-screen w-[220px] bg-[#F9F9F9]/95 dark:bg-[#171717]/95 backdrop-blur-sm text-black dark:text-white",
                "transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0"
            )}
        >
            <ScrollArea className="flex-grow">
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
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg[#f0f0f0] dark:hoverbg[#212121] flex items-center justify-center"
                        onClick={handleNewChat}
                    >
                        <MessageCirclePlus size={20} className="text-black dark:text-white"/>
                    </Button>
                </div>

                {/* 对话列表区域 */}
                <div className="py-4 mt-2">
                    {isVisible && groupedItems.length > 0 ? (
                        <motion.div
                            key="group"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="overflow-hidden"
                            layoutId="group"
                        >
                            {renderGroupItems}
                        </motion.div>
                    ) : (
                        <div
                            className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10"
                        >
                            {t('没有对话')}
                        </div>
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
