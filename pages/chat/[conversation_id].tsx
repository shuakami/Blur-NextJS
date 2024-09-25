// pages/chat/[conversation_id].tsx
"use client";

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import ChatList from '@/app/[消息显示]/chat_list';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import {ChatProvider} from '@/app/[上下文]/ChatContext';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {useUser} from '@clerk/nextjs';
import {motion, AnimatePresence} from 'framer-motion';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import CText from '@/app/copyright/ctext';

const SIDEBAR_WIDTH = 200; // 固定侧边栏宽度

export default function ChatPage() {
    const router = useRouter();
    const {conversation_id} = router.query;

    const [exists, setExists] = useState<boolean | null>(null);
    const {isSignedIn, isLoaded, user} = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    useEffect(() => {
        if (!isLoaded) return;

        // 用户未登录，显示提示信息
        if (!isSignedIn) {
            setExists(false);
            return;
        }

        // 等待 conversation_id 可用
        if (!conversation_id || typeof conversation_id !== 'string') {
            return;
        }

        const checkConversationExists = async () => {
            try {
                const history = await fetchHistory({user_id: user?.id, conversation_id});
                if (history && history.messages.length > 0) {
                    setExists(true);
                } else {
                    setExists(false);
                }
            } catch (error) {
                setExists(false);
            }
        };

        checkConversationExists();
    }, [conversation_id, isSignedIn, isLoaded, user?.id]);

    useEffect(() => {
        if (exists === false) {
            // 对话不存在，重定向到首页
            router.replace('/');
        }
    }, [exists, router]);

    if (!isLoaded) {
        return <div>加载中...</div>; // 等待 Clerk 加载完成
    }

    if (!isSignedIn) {
        return <div>您未登录，请登录后查看对话。</div>; // 未登录时显示
    }

    if (exists === null || !conversation_id || typeof conversation_id !== 'string') {
        return <div>加载中...</div>;
    }

    return (
        <ChatProvider initialConversationId={conversation_id}>
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
                        <ChatList/>
                    </div>

                    {/* 输入框容器 */}
                    <div className="p-4 flex flex-col items-center w-full">
                        <div className="w-full sm:max-w-2xl lg:max-w-xl">
                            <ChatInputWrapper/>
                        </div>
                        <CText/> {/* 添加版权组件 */}
                    </div>
                </motion.div>
            </div>
        </ChatProvider>
    );
}
