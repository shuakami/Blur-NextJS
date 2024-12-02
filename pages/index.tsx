"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChatProvider, useChatStateContext, useConversationContext } from '@/app/[上下文]/ChatContext';
import { ConversationsProvider } from "../contexts/ConversationsContext";
import dynamic from 'next/dynamic';
import HomepageContent from "@/app/[首页占位]/home-content";
import { SharedChatLayout } from '@/components/layouts/SharedChatLayout';
import MobileContent from '@/app/[首页占位]/mobile-content';
import ChatList from '@/app/[消息显示]/chat_list';

const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });

function HomeContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { newConversationId, resetNewConversationId } = useConversationContext();
  const { resetChatState } = useChatStateContext();

  const [chatState, setChatState] = useState({
    hasConversation: false,
    chatTitle: null as string | null,
    isMobile: false
  });

  // 初始化响应式状态
  useEffect(() => {
    const checkMobile = () => {
      setChatState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };

    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  // 处理新对话
  useEffect(() => {
    if (!newConversationId) return;

    const handleNewConversation = (event: CustomEvent) => {
      setChatState(prev => ({ ...prev, chatTitle: event.detail.chat_title }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('addConversation', handleNewConversation as EventListener);

      const url = `/chat/${newConversationId}`;
      window.history.pushState({ conversationId: newConversationId }, '', url);
    }

    setChatState(prev => ({ ...prev, hasConversation: true }));
    resetNewConversationId();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('addConversation', handleNewConversation as EventListener);
      }
    };
  }, [newConversationId, resetNewConversationId]);

  // URL 监听
  useEffect(() => {
    if (searchParams?.get('new') === 'true') {
      resetChatState();
      setChatState(prev => ({ ...prev, hasConversation: false }));
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', pathname);
      }
    }
  }, [searchParams, pathname, resetChatState]);

  // 渲染主内容
  const renderMainContent = useCallback(() => {
    if (chatState.hasConversation) {
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
      <div className={`${chatState.isMobile ? 'flex flex-col justify-center mt-40' : 'flex justify-center items-center'} h-full justify-center`}>
        {chatState.isMobile ? (
          <MobileContent onFirstMessage={() => setChatState(prev => ({ ...prev, hasConversation: true }))} />
        ) : (
          <HomepageContent onFirstMessage={() => setChatState(prev => ({ ...prev, hasConversation: true }))} />
        )}
      </div>
    );
  }, [chatState]);

  // 渲染底部内容
  const renderBottomContent = useCallback(() => {
    if (!chatState.hasConversation) return null;
    return (
      <div className="flex flex-col items-center w-full bg-transparent">
        <div className="w-full max-w-4xl">
          <ChatInputWrapper onFirstMessage={() => setChatState(prev => ({ ...prev, hasConversation: true }))} />
        </div>
        <div className="mt-1 pb-2 pt-1">
          <CText />
        </div>
      </div>
    );
  }, [chatState]);

  return (
    <SharedChatLayout
      title={chatState.chatTitle || undefined}
      description={chatState.hasConversation ? "Chat" : undefined}
      hasConversation={chatState.hasConversation}
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