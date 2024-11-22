"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChatProvider, useChatContext } from '@/app/[上下文]/ChatContext';
import { ConversationsProvider } from "../../contexts/ConversationsContext";
import dynamic from 'next/dynamic';
import HomepageContent from "@/app/[首页占位]/home-content";
import { SharedChatLayout } from '@/components/layouts/SharedChatLayout';

// 动态导入非关键组件
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), { ssr: false });
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });

function HomeContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { newConversationId, resetNewConversationId, resetChatState } = useChatContext();
    
    const [hasConversation, setHasConversation] = useState(false);
    const [chatTitle, setChatTitle] = useState<string | null>(null);
    const eventListenerRef = useRef<(event: Event) => void>();

    // 处理新对话
    useEffect(() => {
        if (!newConversationId) return;

        const handleNewConversation = (event: CustomEvent) => {
            setChatTitle(event.detail.chat_title);
        };

        eventListenerRef.current = handleNewConversation as (event: Event) => void;
        window?.addEventListener('addConversation', eventListenerRef.current);
        
        const url = `/chat/${newConversationId}`;
        window?.history.pushState({ conversationId: newConversationId }, '', url);
        
        setHasConversation(true);
        resetNewConversationId();

        return () => {
            if (eventListenerRef.current) {
                window?.removeEventListener('addConversation', eventListenerRef.current);
            }
        };
    }, [newConversationId, resetNewConversationId]);

    // URL 监听
    useEffect(() => {
        if (searchParams?.get('new') === 'true') {
            resetChatState();
            setHasConversation(false);
            window?.history.replaceState({}, '', pathname);
        }
    }, [searchParams, pathname, resetChatState]);

    // 渲染主内容
    const renderMainContent = useCallback(() => {
        if (hasConversation) {
            return (
                <div className="flex-1 overflow-auto w-full pt-12">
                    <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                        <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]">
                            <ChatList />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex justify-center items-center h-full">
                <HomepageContent 
                    onFirstMessage={() => setHasConversation(true)}
                />
            </div>
        );
    }, [hasConversation]);

    // 渲染底部内容
    const renderBottomContent = useCallback(() => {
        if (!hasConversation) return null;
        return (
            <div className="flex flex-col items-center w-full bg-transparent">
                <div className="w-full max-w-4xl">
                    <ChatInputWrapper 
                        onFirstMessage={() => setHasConversation(true)} 
                    />
                </div>
                <CText />
                <div className="mb-3"/>
            </div>
        );
    }, [hasConversation]);

    return (
        <SharedChatLayout
            title={chatTitle || undefined}
            description={hasConversation ? "Chat" : undefined}
            hasConversation={hasConversation}
            showAvatar={true}
            renderMainContent={renderMainContent}
            renderBottomContent={renderBottomContent}
        />
    );
}

export default function Home() {
    return (
        <ConversationsProvider>
            <ChatProvider>
                <HomeContent />
            </ChatProvider>
        </ConversationsProvider>
    );
}