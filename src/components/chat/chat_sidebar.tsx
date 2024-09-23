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
import { v4 as uuidv4 } from 'uuid'; // 引入 uuid


interface ChatSidebarProps {
    items: SidebarItemType[];
    user: {
        avatarUrl: string;
        name: string;
        status: string;
    };
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ items, user }) => {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [folderItems, setFolderItems] = useState<SidebarItemType[]>(items); // 本地状态，用于管理文件夹项
    const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false); // 是否在创建新文件夹
    const [newFolderName, setNewFolderName] = useState<string>(''); // 新文件夹的名称

    const router = useRouter(); // 用于新建对话的路由跳转

    const handleSelectItem = (label: string) => {
        setSelectedItem(label);
    };

    // 用于处理动画的控制器
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            opacity: 1,
            transition: { duration: 0.5 },
        });
    }, [folderItems, controls]);

    // 新建对话的函数
    const handleNewChat = () => {
        router.push('/new-chat');
    };

    // 新建文件夹的函数
    const handleNewFolder = () => {
        setIsCreatingFolder(true);
        setNewFolderName(''); // 清空输入框
    };

    // 保存新文件夹
    const saveNewFolder = () => {
        if (newFolderName.trim() === '') {
            setIsCreatingFolder(false); // 名称为空时取消创建
            return;
        }
        const newFolder: SidebarItemType = {
            label: newFolderName,
            children: [], // 新建文件夹没有子项
        };
        setFolderItems([newFolder, ...folderItems]); // 新文件夹加到文件夹项列表顶部
        setIsCreatingFolder(false); // 结束创建状态
    };

    // 按下回车保存新文件夹
    const handleFolderNameChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            saveNewFolder();
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            className="flex flex-col h-screen w-[210px] bg-[#F9F9F9]/65 dark:bg-[#171717] text-black dark:text-white"
        >
            {/* 滚动区域 */}
            <ScrollArea className="flex-grow">
                {/* 顶部按钮 */}
                <div className="flex space-x-3 mt-5 w-44 justify-center items-center mx-4">
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={handleNewChat} // 点击新建对话按钮，跳转到 /new-chat
                    >
                        <LucideAppWindow size={20} className="text-black dark:text-white" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={handleNewFolder} // 点击新建文件夹按钮
                    >
                        <FolderAddIcon size={20} className="text-black dark:text-white" />
                    </Button>
                </div>

                {/* 侧边栏内容 */}
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
                            folderItems.map((item, index) => (
                                <SidebarItemComponent
                                    // @ts-ignore
                                    key={item.label + index} // 确保唯一性
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

            {/* 底部用户信息 */}
            <UserInfo avatarUrl={user.avatarUrl} name={user.name} status={user.status} />
        </motion.div>
    );
};

export default ChatSidebar;
