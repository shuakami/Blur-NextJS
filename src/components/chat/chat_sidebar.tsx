"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {SidebarItemType, DateGroup} from './chat_sidebar/types'; // 引入 DateGroup
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import UserInfo from './chat_sidebar/UserInfo';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import DateLabel from '@/lib/DateLabel';
import {MessageCirclePlus, SidebarCloseIcon} from "lucide-react";

interface ChatSidebarProps {
    items: SidebarItemType[];
    user: {
        avatarUrl: string;
        name: string;
        status: string;
    };
    onClose: () => void; // 新增
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({items, user, onClose}) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const router = useRouter();
    const controls = useAnimation();

    const handleSelectItem = (id: any, href?: string) => {
        setSelectedItem(id);
        if (href) {
            router.push(href);  // 确保 href 是一个 string
        }
    };

    useEffect(() => {
        controls.start({
            opacity: 1,
            transition: { duration: 0.5 },
        });
    }, [items, controls]);

    const handleNewChat = () => {
        router.push('/');
    };

    // 类型保护函数：判断是否为 DateGroup
    const isDateGroup = (item: SidebarItemType): item is DateGroup => {
        return (item as DateGroup).date !== undefined;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            className="flex flex-col h-screen w-[210px] bg-[#F9F9F9]/65 dark:bg-[#171717] text-black dark:text-white"
        >
            <ScrollArea className="flex-grow">
                <div className="flex space-x-3 mt-5 w-44 justify-center items-center mx-4">
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

                <div className="py-4 mt-2">
                    <AnimatePresence>
                        {items.length > 0 ? (
                            items.map((item) =>
                                isDateGroup(item) ? ( // 使用类型保护来区分 DateGroup
                                    <div key={item.date}>
                                        <div className="text-black/60 dark:text-[#999999] text-xs mx-6 my-2">
                                            <DateLabel timestamp={item.date}/>
                                        </div>
                                        {item.children?.map((subItem) => ( // 检查 children 是否存在
                                            <SidebarItemComponent
                                                key={subItem.id}
                                                item={subItem}
                                                level={0}
                                                selectedItem={selectedItem}
                                                onSelect={() => handleSelectItem(subItem.id, subItem.href)}
                                            />
                                        ))}
                                    </div>
                                ) : null
                            )
                        ) : (
                            <motion.div
                                className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                没有对话
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>

            <UserInfo avatarUrl={user.avatarUrl} name={user.name} status={user.status} />
        </motion.div>
    );
};

export default ChatSidebar;
