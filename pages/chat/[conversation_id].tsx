"use client";

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';  // 使用 next/router
import ChatList from '@/app/[消息显示]/chat_list';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import {ChatProvider} from '@/app/[上下文]/ChatContext';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {useUser} from '@clerk/nextjs'; // 使用 Clerk 获取用户信息

export default function ChatPage() {
    const router = useRouter();  // 使用 useRouter 获取 router
    const {conversation_id} = router.query;  // 从 router.query 中获取 conversation_id

    const [exists, setExists] = useState<boolean | null>(null);
    const {isSignedIn, isLoaded, user} = useUser();  // 从 Clerk 获取登录状态和用户信息

    useEffect(() => {
        if (!isLoaded) return;  // 等待 Clerk 用户信息加载完成

        // 用户未登录，显示提示信息
        if (!isSignedIn) {
            setExists(false);
            return;
        }

        // Debug 信息
        console.log('exists:', exists);
        console.log('conversation_id:', conversation_id);

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
            <div className="w-full h-screen flex flex-row">
                {/* 左侧的侧边栏 */}
                <div className="w-1/4 min-w-[200px] md:w-1/5 lg:w-1/4 h-full">
                    <MessagesSidebar/>
                </div>

                {/* 右侧的聊天列表和输入框 */}
                <div className="h-full flex flex-col flex-1">
                    <div className="flex-1 overflow-auto p-4">
                        <ChatList/>
                    </div>
                    <div className="w-full flex justify-center p-4">
                        <div className="w-full max-w-2xl">
                            <ChatInputWrapper/>
                        </div>
                    </div>
                </div>
            </div>
        </ChatProvider>
    );
}
