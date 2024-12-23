"use client";

import React, { useCallback, Suspense } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { ChatProvider } from "@/app/[上下文]/ChatContext";
import { useConversationCheck } from '../../src/hooks/api/useConversationCheck';
import { useConversations } from '../../src/app/[对话管理]/ConversationsContext';
import dynamic from 'next/dynamic';
import { SharedChatLayout } from '@/components/layouts/SharedChatLayout';
import NoConversationFound from '@/components/chat/NoConversationFound';
import { ErrorBoundary } from 'react-error-boundary';
import ChatList from '@/app/[消息显示]/chat_list';
import ErrorFallback from '@/components/ui/error-fallback';

// 类型定义
interface ChatPageProps {
    conversation_id?: string;
}

const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), {
    ssr: false
});

const CText = dynamic(() => import('@/app/copyright/ctext'), {
    ssr: false
});

const SimplifiedUnauthenticatedHomePage = dynamic(() =>
    import("@/components/NoLogin/nologin_home"), {
    ssr: false
});

// 主要内容组件
const ChatPageContent = React.memo(function ChatPageContent({
    conversation_id
}: ChatPageProps) {
    const { conversations } = useConversations();
    const { isSignedIn, isLoaded, user } = useUser();
    const { exists } = useConversationCheck(conversation_id, user?.id);

    // 获取对话标题
    const chatTitle = conversations.find(c =>
        c.conversation_id === conversation_id
    )?.chat_title || '未命名对话';

    // 主要内容
    const MainContent = useCallback(() => (
        <div className="flex-1 overflow-auto w-full h-full pt-12 scroll-container">
            <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[49.5rem] xl:max-w-[49.5rem] max-w-3xl">
                    <ErrorBoundary 
                        FallbackComponent={(props) => (
                            <ErrorFallback 
                                {...props}
                                title="聊天加载失败"
                                className="min-h-[120px]"
                            />
                        )}
                    >
                        <ChatList />
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    ), []);

    // 底部内容
    const BottomContent = useCallback(() => (
        <div className="flex flex-col items-center w-full bg-transparent">
            <div className="w-full max-w-4xl">
                <Suspense fallback={null}>
                    <ChatInputWrapper />
                </Suspense>
            </div>
            <div className="mt-1 pb-2 pt-1">
                <CText />
            </div>
        </div>
    ), []);

    // 未登录状态
    if (!isSignedIn && isLoaded) {
        return (
            <Suspense fallback={null}>
                <SimplifiedUnauthenticatedHomePage />
            </Suspense>
        );
    }

    // 对话不存在
    if (exists === false) {
        return <NoConversationFound />;
    }

    return (
        <SharedChatLayout
            title={chatTitle}
            hasConversation={true}
            showAvatar={false}
            renderMainContent={MainContent}
            renderBottomContent={BottomContent}
        />
    );
});

// 页面组件
export default function ChatPage() {
    const router = useRouter();
    const { conversation_id } = router.query;
    const normalizedId = Array.isArray(conversation_id) ? conversation_id[0] : conversation_id;

    return (
        <ErrorBoundary 
            FallbackComponent={(props) => (
                <ErrorFallback 
                    {...props}
                    title="页面加载失败"
                    className="min-h-screen"
                />
            )}
        >
            <ChatProvider initialConversationId={normalizedId}>
                <ChatPageContent conversation_id={normalizedId} />
            </ChatProvider>
        </ErrorBoundary>
    );
}
