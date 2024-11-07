// src/app/[上下文]/ChatContext.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { Message } from '@/types/stream';
import useChat from './hooks/useChat';

interface ChatContextProps {
    messages: Message[];
    sendMessage: (message: string, conversationId?: string) => void;
    addMessage: (message: Message) => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;
    newConversationId: string | null;
    resetNewConversationId: () => void;
    isLoading?: boolean;
    loadMoreMessages: () => void;
    isStreaming?: boolean; // 是否正在流式传输
    stopStreaming?: () => void; // 停止流式传输
    conversationId?: string | null; // 暴露 conversationId
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode; initialConversationId?: string }> = ({
    children,
    initialConversationId,
}) => {
    const chat = useChat(initialConversationId);

    // 使用 useMemo 记忆化 context value，避免不必要的重新渲染
    const contextValue = useMemo(() => chat, [chat]);

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = (): ChatContextProps => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext 必须在 ChatProvider 内使用');
    }
    return context;
};