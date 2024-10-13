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
import {ConversationsProvider} from "../../contexts/ConversationsContext";
import UserAvatar from '@/components/ui/page_right_user_avatar';

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
        if (newConversationId) {
            const timeoutId = setTimeout(() => {
                router.push(`/chat/${newConversationId}`);
                resetNewConversationId(); // 重置新对话 ID
            },);

            return () => clearTimeout(timeoutId); // 清除定时器
        }
    }, [newConversationId, resetNewConversationId, router]);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            Cookies.set('isSidebarOpen', newState.toString(), {expires: 7});
            return newState;
        });
    };

    return (
        <div className="w-full h-screen flex overflow-hidden relative">
            {/* 侧边栏 */}
            <motion.div
                className="h-full z-30"
                style={{
                    width: SIDEBAR_WIDTH,
                    position: 'fixed',
                    left: 0,
                    top: 0,
                }}
                initial={{x: 0}}
                animate={{x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH}} // 侧边栏始终固定在左侧
                transition={{
                    duration: 0.55,
                    ease: [0.25, 0.8, 0.25, 1],
                }}
            >
                <MessagesSidebar onClose={toggleSidebar}/>
            </motion.div>


            {/* 主内容区域 */}
            <motion.div
                className="flex flex-col h-full overflow-hidden"
                style={{
                    flexGrow: 1,
                    marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0,
                    zIndex: isSidebarOpen ? 30 : 40, // 主内容区域在侧边栏关闭时提升 z-index
                }}
                initial={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                animate={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                transition={{
                    duration: 0.65,
                    ease: [0.25, 0.8, 0.25, 1],
                }}
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


                {/* 右上角用户头像 */}
                <div className="absolute top-[2.5%] right-[2%] z-50">
                    <UserAvatar/>
                </div>

            </motion.div>
        </div>
    );
};

export default function Home() {
    return (
        <ConversationsProvider>
            <ChatProvider>
                <HomeContent/>
            </ChatProvider>
        </ConversationsProvider>
    );
}
