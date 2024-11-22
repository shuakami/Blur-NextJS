"use client";

import React, { useCallback, useEffect, useState, Suspense, memo } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { ChatProvider } from "@/app/[上下文]/ChatContext";
import { fetchHistory } from '@/app/[拉取历史]/fetch_history';
import { useConversations } from '../../contexts/ConversationsContext';
import dynamic from 'next/dynamic';
import { SharedChatLayout } from '@/components/layouts/SharedChatLayout';
import NoConversationFound from '@/components/chat/NoConversationFound';

// 动态导入非关键组件
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), { ssr: false });
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });
const SimplifiedUnauthenticatedHomePage = dynamic(() => 
    import("@/components/NoLogin/nologin_home"), { ssr: false }
);

const MAX_RETRY_COUNT = 3;

const ChatPageContent = memo(function ChatPageContent() {
    const router = useRouter();
    const { conversation_id } = router.query;
    const { conversations } = useConversations();
    const { isSignedIn, isLoaded, user } = useUser();

    const [state, setState] = useState({
        isLoaded: false,
        exists: null as boolean | null,
        retryCount: 0,
        isClient: false
    });

    // 获取对话标题
    const chat_title = conversations.find(c => 
        c.conversation_id === conversation_id
    )?.chat_title || '未命名对话';

    // 客户端初始化
    useEffect(() => {
        setState(prev => ({ ...prev, isClient: true }));
    }, []);

    // 检查对话是否存在
    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setState(prev => ({ ...prev, exists: false }));
            return;
        }
        if (!conversation_id || typeof conversation_id !== 'string') return;

        const checkConversationExists = async () => {
            try {
                const history = await fetchHistory({ 
                    user_id: user?.id, 
                    conversation_id, 
                    limit: 1 
                });
                setState(prev => ({ ...prev, exists: Boolean(history?.messages.length) }));
            } catch (error) {
                if (state.retryCount < MAX_RETRY_COUNT) {
                    setState(prev => ({ 
                        ...prev, 
                        retryCount: prev.retryCount + 1 
                    }));
                } else {
                    setState(prev => ({ ...prev, exists: false, isLoaded: true }));
                }
            }
        };

        checkConversationExists();
    }, [conversation_id, isSignedIn, isLoaded, user?.id, state.retryCount]);

    // 渲染主要内容
    const renderMainContent = useCallback(() => (
        <div className="flex-1 overflow-auto w-full pt-12 scroll-container"> 
            <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[49.5rem] xl:max-w-[49.5rem]">
                    <ChatList />
                </div>
            </div>
        </div>
    ), []);

    // 渲染底部内容
    const renderBottomContent = useCallback(() => (
        <div className="flex flex-col items-center w-full bg-transparent">
            <div className="w-full max-w-4xl">
                <Suspense fallback={null}>
                    <ChatInputWrapper />
                </Suspense>
            </div>
            <Suspense fallback={null}>
                <CText />
            </Suspense>
            <div className="mb-2" />
        </div>
    ), []);

    if (state.exists === false && state.isLoaded) {
        return <NoConversationFound />;
    }

    if (!isSignedIn && isLoaded) {
        return (
            <Suspense fallback={null}>
                <SimplifiedUnauthenticatedHomePage />
            </Suspense>
        );
    }

    return (
        <SharedChatLayout
            title={chat_title}
            hasConversation={true}
            showAvatar={false}
            renderMainContent={renderMainContent}
            renderBottomContent={renderBottomContent}
        />
    );
});

export default function ChatPage() {
    const router = useRouter();
    const { conversation_id } = router.query;

    return (
        <ChatProvider initialConversationId={Array.isArray(conversation_id) ? conversation_id[0] : conversation_id}>
            <ChatPageContent />
        </ChatProvider>
    );
}