// src/app/page.tsx
"use client";

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import ChatList from '@/app/[消息显示]/chat_list';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import {ChatProvider, useChatContext} from '@/app/[上下文]/ChatContext';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import {motion, AnimatePresence} from 'framer-motion';
import CText from '@/app/copyright/ctext';
import HomepageContent from "@/app/[首页占位]/home-content";
import Cookies from 'js-cookie';

const SIDEBAR_WIDTH = 220;

const HomeContent = () => {
    const router = useRouter();
    const {newConversationId, resetNewConversationId} = useChatContext();
    const [hasConversation, setHasConversation] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
        // 从 cookies 初始化侧边栏状态
        const storedState = Cookies.get('isSidebarOpen');
        return storedState ? storedState === 'true' : true;
    });

    useEffect(() => {
        console.log("Page loaded with newConversationId:", newConversationId);
        if (newConversationId) {
            const timeoutId = setTimeout(() => {
                router.push(`/chat/${newConversationId}`);
                resetNewConversationId(); // 重置新对话 ID
            },);

            return () => clearTimeout(timeoutId); // 清除定时器
        }
    }, [newConversationId, router]);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            Cookies.set('isSidebarOpen', newState.toString(), {expires: 7});
            return newState;
        });
    };

    return (
        <div className="w-full h-screen flex overflow-hidden">
            {/* 侧边栏 */}
            <motion.div
                className="fixed top-0 left-0 h-full z-30"
                style={{width: SIDEBAR_WIDTH}}
                initial={{x: -SIDEBAR_WIDTH}}
                animate={{x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH}}
                transition={{duration: 0.3, ease: "easeInOut"}}
            >
                <MessagesSidebar onClose={toggleSidebar}/>
            </motion.div>

            {/* 主内容区域 */}
            <motion.div
                className="flex flex-col h-full w-full overflow-hidden"
                style={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                initial={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                animate={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                transition={{duration: 0.3, ease: "easeInOut"}}
            >
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
                <div className="flex-1 overflow-auto w-full mt-16">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        {hasConversation ? (
                            <ChatList/>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <HomepageContent/>
                            </div>
                        )}
                    </div>
                </div>

                {/* 输入框容器 */}
                <div className="p-4 flex flex-col items-center w-full bg-transparent">
                    <div className="w-full max-w-4xl">
                        <ChatInputWrapper onFirstMessage={() => setHasConversation(true)}/>
                    </div>
                    <CText/>
                </div>
            </motion.div>
        </div>
    );
};

export default function Home() {
    return (
        <ChatProvider>
            <HomeContent/>
        </ChatProvider>
    );
}
