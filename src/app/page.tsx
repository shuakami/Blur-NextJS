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
import ModelSelector from "@/components/ui/model_selector";

const SIDEBAR_WIDTH = 220;

const HomeContent = () => {
    const router = useRouter();
    const {newConversationId, resetNewConversationId} = useChatContext();
    const [hasConversation, setHasConversation] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
        const storedState = Cookies.get('isSidebarOpen');
        return storedState ? storedState === 'true' : true;
    });

    useEffect(() => {
        if (newConversationId) {
            const timeoutId = setTimeout(() => {
                router.push(`/chat/${newConversationId}`);
                resetNewConversationId();
            },);

            return () => clearTimeout(timeoutId);
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
                animate={{x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH}}
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
                    zIndex: isSidebarOpen ? 30 : 40,
                }}
                initial={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                animate={{marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0}}
                transition={{
                    duration: 0.65,
                    ease: [0.25, 0.8, 0.25, 1],
                }}
            >
                {/* 顶部导航栏部分 */}
                <div className="flex justify-between items-center px-4 py-4 z-40">
                    <div className="flex items-center space-x-4">
                        {/* HomeHeaderIcon */}
                        <motion.div
                            className="absolute top-4 left-4 z-40"
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: -20}}
                            transition={{
                                duration: 0.15,
                                ease: 'easeOut',
                            }}
                        >
                            <HomeHeaderIcon isSidebarOpen={isSidebarOpen} onOpen={toggleSidebar}/>
                        </motion.div>
                        {/* ModelSelector */}
                        <motion.div
                            className="absolute top-[16.7] z-40"
                            initial={{
                                left: isSidebarOpen ? '13.5rem' : '6rem',
                                opacity: 0,
                                y: -10
                            }}
                            animate={{left: isSidebarOpen ? '13.5rem' : '6rem', opacity: 1, y: 0}}
                            transition={{
                                duration: 0.45,
                                ease: [0.25, 0.8, 0.25, 1],
                                delay: 0.05
                            }}
                        >
                            <ModelSelector/>
                        </motion.div>
                    </div>
                    {/* 右上角用户头像 */}
                    <UserAvatar/>
                </div>

                {/* 聊天内容区域 */}
                <div className="flex-1 overflow-auto w-full mt-4">
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
        <ConversationsProvider>
            <ChatProvider>
                <HomeContent/>
            </ChatProvider>
        </ConversationsProvider>
    );
}
