// src/components/chat/ChatSidebar.tsx
"use client";

import React, {useState, useEffect, useMemo} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {SidebarItemType, SidebarItem} from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import UserInfo from './chat_sidebar/UserInfo';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {MessageCirclePlus, SidebarCloseIcon} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";
import dayjs from 'dayjs';

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

const ChatSidebar: React.FC<ChatSidebarProps> = ({onUpdateConversations, items, user, onClose}) => {
    const {t} = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const controls = useAnimation();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // 处理对话选择
    const handleSelectItem = (id: string, href?: string) => {
        setSelectedItem(id);  // 设置选中的对话项
        if (href) {
            router.push(href);  // 跳转到相应的对话页面
        }
    };

    // 根据 URL 更新 selectedItem
    useEffect(() => {
        if (!pathname) return;
        const pathParts = pathname.split('/');
        const conversationId = pathParts[pathParts.length - 1];
        setSelectedItem(conversationId || null);
    }, [pathname]);

    useEffect(() => {
        controls.start({
            opacity: 1,
            transition: { duration: 0.5 },
        });
    }, [items, controls]);

    const handleNewChat = () => {
        router.push('/');
    };

    // 暴力解决：确保每个日期标签只渲染一次
    const groupedItems: { children: SidebarItem[]; label: string }[] = useMemo(() => {
        const map = new Map<string, SidebarItem[]>();
        const now = dayjs();
        const dateLabelSet = new Set<string>(); // 记录已经渲染过的日期标签

        items.forEach((item) => {
            if ('date' in item) { // 判断是否为 DateGroup
                const dateLabel = dayjs(item.date).isSame(now, 'day') ? '今天' :
                    dayjs(item.date).isSame(now.subtract(1, 'day'), 'day') ? '昨天' :
                        dayjs(item.date).isSame(now.subtract(2, 'day'), 'day') ? '前天' :
                            dayjs(item.date).isAfter(now.startOf('week')) ? '这个星期' :
                                dayjs(item.date).isAfter(now.startOf('month')) ? '这个月' :
                                    dayjs(item.date).isAfter(now.subtract(3, 'month')) ? '最近3个月' :
                                        dayjs(item.date).isAfter(now.startOf('year')) ? '今年' :
                                            dayjs(item.date).format('YYYY 年');

                // 如果该日期标签已经存在，则将项目合并到已有的组中
                if (!dateLabelSet.has(dateLabel)) {
                    dateLabelSet.add(dateLabel);
                    map.set(dateLabel, item.children || []);
                } else {
                    // 合并到已有的日期组中
                    const existingChildren = map.get(dateLabel) || [];
                    map.set(dateLabel, existingChildren.concat(item.children || []));
                }
            }
        });

        // 转换为数组并按时间顺序排列
        return Array.from(map.entries()).map(([dateLabel, children]) => ({
            label: dateLabel,
            children,
        }));
    }, [items]);

    // 定义优雅的动画配置
    const animationConfig = useMemo(() => ({
        initial: { height: 0 },
        animate: { height: "auto" },
        exit: { height: 0 },
        transition: { 
            duration: 0.55,
            ease: [0.25, 0.8, 0.25, 1]  // 使用贝塞尔曲线实现更流畅的动画
        }
    }), []);
    

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            className="flex flex-col h-screen w-[220px] bg-[#F9F9F9]/95 dark:bg-[#171717]/95 backdrop-blur-sm text-black dark:text-white"
        >
            <ScrollArea className="flex-grow">
                <div className="flex space-x-3 mt-[18px] w-44 justify-center items-center mx-4">
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

                <div className="py-4 mt-2">
                    {groupedItems.length > 0 ? (
                        <AnimatePresence mode="wait">
                            {groupedItems.map((group) => (
                                <div key={group.label}>
                                    <div className="text-black/60 dark:text-white/80 text-xs mx-6 my-2">
                                        <span>{group.label}</span>
                                    </div>
                                    <motion.div
                                        {...animationConfig}
                                        className="overflow-hidden"
                                    >
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
                                    </motion.div>
                                </div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
                            {t('没有对话')}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <UserInfo avatarUrl={user.avatarUrl} name={user.name} status={user.status} />
        </motion.div>
    );
};

export default ChatSidebar;
