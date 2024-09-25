// app/page.tsx
"use client";

import React, {useState} from 'react';
import ChatList from '@/app/[消息显示]/chat_list';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import {ChatProvider} from '@/app/[上下文]/ChatContext';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import HomepageContent from "@/app/[首页占位]/home-content";
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import {motion, AnimatePresence} from 'framer-motion';
import CText from '@/app/copyright/ctext';

const SIDEBAR_WIDTH = 200; // 固定侧边栏宽度

export default function Home() {
    const [hasConversation, setHasConversation] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <ChatProvider>
            <div className="w-full h-screen flex overflow-hidden">
                {/* 侧边栏 */}
                <motion.div
                    className="fixed top-0 left-0 h-full shadow-lg z-30"
                    style={{width: SIDEBAR_WIDTH}}
                    initial={{x: -SIDEBAR_WIDTH}}
                    animate={{x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH}}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                >
                    <MessagesSidebar onClose={toggleSidebar}/>
                </motion.div>

                {/* 主内容区域 */}
                <motion.div
                    className="flex flex-col h-full w-full"
                    style={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                    initial={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                    animate={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                >
                    {/* Header 中的 SidebarOpenIcon */}
                    <AnimatePresence>
                        {!isSidebarOpen && (
                            <motion.div
                                className="absolute top-4 left-4 z-40"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.2}}
                            >
                                <HomeHeaderIcon isSidebarOpen={isSidebarOpen} onOpen={toggleSidebar}/>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 聊天内容区域 */}
                    <div className="flex-1 overflow-auto w-full p-4">
                        {hasConversation ? (
                            <ChatList/>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <HomepageContent/>
                            </div>
                        )}
                    </div>

                    {/* 输入框容器 */}
                    <div className="p-4 flex flex-col items-center w-full">
                        <div className="w-full sm:max-w-2xl lg:max-w-xl">
                            <ChatInputWrapper onFirstMessage={() => setHasConversation(true)}/>
                        </div>
                        <CText/>
                    </div>
                </motion.div>
            </div>
        </ChatProvider>
    );
}
