"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarItemType } from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import UserInfo from './chat_sidebar/UserInfo';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import DateLabel from '@/lib/DateLabel';  // 引入 DateLabel

interface ChatSidebarProps {
    items: SidebarItemType[];
    user: {
        avatarUrl: string;
        name: string;
        status: string;
    };
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({items, user}) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const router = useRouter();
    const controls = useAnimation();

    const handleSelectItem = (id: string, href?: string) => {
        setSelectedItem(id);
        if (href) {
            router.push(href);
        }
    };

    useEffect(() => {
        controls.start({
            opacity: 1,
            transition: { duration: 0.5 },
        });
    }, [items, controls]);

    const handleNewChat = () => {
        router.push('/new-chat');
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
                        className="w-full text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={handleNewChat}
                    >
                        新建对话
                    </Button>
                </div>

                <div className="py-4 mt-2">
                    <AnimatePresence>
                        {items.length > 0 ? (
                            items.map(item =>
                                'children' in item ? (
                                    <div key={item.date}>
                                        <div className="text-gray-500 text-xs mx-4 my-2">
                                            <DateLabel timestamp={item.date}/>
                                        </div>
                                        {item.children.map(subItem => (
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
