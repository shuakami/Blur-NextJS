// src/components/chat/ChatSidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LucideAppWindow } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderAddIcon } from "hugeicons-react";
import { SidebarItemType } from './chat_sidebar/types';
import SidebarItemComponent from './chat_sidebar/SidebarItemComponent';
import UserInfo from './chat_sidebar/UserInfo';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface ChatSidebarProps {
    items: SidebarItemType[];
    user: {
        avatarUrl: string;
        name: string;
        status: string;
    };
    onSelectConversation: (conversation_id: string) => void; // 添加回调
}

const assignIds = (items: SidebarItemType[]): SidebarItemType[] => {
    return items.map(item => {
        const newItem = { ...item, id: item.id || uuidv4() };
        if (newItem.children && newItem.children.length > 0) {
            newItem.children = assignIds(newItem.children);
        }
        return newItem;
    });
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({items, user, onSelectConversation}) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [folderItems, setFolderItems] = useState<SidebarItemType[]>(assignIds(items)); // Ensure unique ids
    const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');

    const router = useRouter();

    const controls = useAnimation();

    useEffect(() => {
        console.log('folderItems 更新:', folderItems);
        controls.start({
            opacity: 1,
            transition: { duration: 0.5 },
        });
    }, [folderItems, controls]);

    const handleNewChat = () => {
        router.push('/new-chat');
    };

    const handleNewFolder = () => {
        setIsCreatingFolder(true);
        setNewFolderName('');
    };

    const saveNewFolder = () => {
        if (newFolderName.trim() === '') {
            setIsCreatingFolder(false);
            return;
        }
        const newFolder: SidebarItemType = {
            id: uuidv4(),
            label: newFolderName,
            children: [],
        };
        console.log('添加新文件夹:', newFolder);
        setFolderItems(prevFolders => [newFolder, ...prevFolders]);
        setIsCreatingFolder(false);
    };

    const handleFolderNameChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            saveNewFolder();
        }
    };

    const handleSelectItem = (label: string) => {
        setSelectedItem(label);
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
                        onClick={handleNewChat}
                    >
                        <LucideAppWindow size={20} className="text-black dark:text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={handleNewFolder}
                    >
                        <FolderAddIcon size={20} className="text-black dark:text-white" />
                    </Button>
                </div>

                <div className="py-4 mt-2">
                    <AnimatePresence>
                        {isCreatingFolder && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mx-4 mb-2"
                            >
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={handleFolderNameChange}
                                    className="w-full p-2 bg-[#e0e0e0] dark:bg-[#333333] text-black dark:text-white rounded-md focus:outline-none"
                                    placeholder="输入文件夹名称..."
                                    autoFocus
                                />
                            </motion.div>
                        )}

                        {folderItems.length > 0 ? (
                            folderItems.map(item => (
                                <SidebarItemComponent
                                    key={item.id}
                                    item={item}
                                    level={0}
                                    selectedItem={selectedItem}
                                    onSelect={handleSelectItem}
                                />
                            ))
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
