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
import Cookies from "js-cookie";
import ScrollToBottom from "@/components/ui/ScrollToBottom";
import HomePageLoading from "@/components/Loading/loading_converdation_page";
import SimplifiedUnauthenticatedHomePage from "@/components/NoLogin/nologin_home";
import Meta from "@/components/ui/Meta";
import {useConversations} from "../../contexts/ConversationsContext";

const SIDEBAR_WIDTH = 220; // 固定侧边栏宽度
const MAX_RETRY_COUNT = 3;  // 最大重试次数

export default function ChatPage() {
    const router = useRouter();
    const {conversation_id} = router.query;
    const [exists, setExists] = useState<boolean | null>(null);
    const {isSignedIn, isLoaded, user} = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [retryCount, setRetryCount] = useState(0);  // 追踪重试次数
    const {conversations} = useConversations(); // 获取 conversations

    // 根据 conversation_id 获取当前对话的 chat_title
    const currentConversation = conversations.find(c => c.conversation_id === conversation_id);
    const chat_title = currentConversation?.chat_title || '未命名对话';

    useEffect(() => {
        // 从 cookies 恢复侧边栏状态
        const sidebarState = Cookies.get('isSidebarOpen');
        if (sidebarState) {
            setIsSidebarOpen(sidebarState === 'true');
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            // 存储新的侧边栏状态到 cookies
            Cookies.set('isSidebarOpen', newState.toString(), {expires: 7}); // 过期时间设置为 7 天
            return newState;
        });
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

        const checkConversationExists = async (retryCount: number) => {
            try {
                const history = await fetchHistory({user_id: user?.id, conversation_id});
                if (history && history.messages.length > 0) {
                    setExists(true);
                } else {
                    setExists(false);
                }
            } catch (error) {
                // 如果失败次数未达到最大值，递归重试
                if (retryCount < MAX_RETRY_COUNT) {
                    setRetryCount(retryCount + 1);
                    checkConversationExists(retryCount + 1);  // 递归调用
                } else {
                    // 如果重试超过3次，跳回主页
                    setExists(false);
                }
            }
        };

        checkConversationExists(retryCount);
    }, [conversation_id, isSignedIn, isLoaded, user?.id, retryCount]);

    useEffect(() => {
        // 对话不存在并且已经登录的情况下（没有登录不跳转），重定向到首页
        // if (exists === false && isSignedIn) {
        //     router.replace('/');
        // }
    }, [exists, router, isSignedIn]);

    if (!isLoaded) {
        return <HomePageLoading/>; // 等待 Clerk 加载完成
    }

    if (!isSignedIn) {
        return <SimplifiedUnauthenticatedHomePage/>; // 未登录时显示
    }

    if (exists === null || !conversation_id || typeof conversation_id !== 'string') {
        return <HomePageLoading/>;
    }


    return (
        <ChatProvider initialConversationId={conversation_id}>
            <Meta pageName={chat_title}/>
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
                    <div className="flex-1 overflow-auto w-full mt-16">
                        <div className="max-w-4xl mx-auto px-4 py-8">
                            <ChatList/>
                            <ScrollToBottom/>
                        </div>
                    </div>

                    {/* 输入框容器 */}
                    <div className="p-4 flex flex-col items-center w-full bg-transparent">
                        <div className="w-full max-w-4xl">
                            <ChatInputWrapper/>
                        </div>
                        <CText/>
                    </div>
                </motion.div>
            </div>
        </ChatProvider>
    );
}
