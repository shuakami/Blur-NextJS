// src/app/[上下文]/useChat.ts

import { useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import useTranslation from "@/hooks/useTranslation";
import { Message } from '@/types/stream';
import '@/app/[上下文]/plugins';

import { chatReducer, initialState } from '@/app/[上下文]/core/chatReducer';
import { addMessageHandler } from '@/app/[上下文]/core/messageHandlers';
import useFetchHistory from '@/app/[上下文]/hooks/useFetchHistory';
import useSendMessage from '@/app/[上下文]/hooks/useSendMessage';

// 自定义 Hook
const useChat = (initialConversationId?: string) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [state, dispatch] = useReducer(chatReducer, {
        ...initialState,
        conversationId: initialConversationId || null,
    });
    const messagesRef = useRef<Message[]>(state.messages);

    // 保持 messagesRef 同步最新的 messages
    useEffect(() => {
        messagesRef.current = state.messages;
        console.log('messagesRef 更新:', messagesRef.current);
    }, [state.messages]);

    const userId = user?.id;
    const userImageUrl = user?.imageUrl;

    // 添加消息
    const addMessage = useCallback((message: Message) => {
        addMessageHandler(message, dispatch);
    }, [dispatch]);

    // 触发对话重载
    const triggerConversationsReload = useCallback(() => {
        dispatch({ type: 'INCREMENT_RELOAD_COUNTER' });
    }, []);

    // 使用自定义 Hooks
    const { sendMessage, stopStreaming } = useSendMessage({
        state,
        dispatch,
        addMessage,
        triggerConversationsReload,
        t,
        userId,
        userImageUrl,
        messagesRef, // 传递 messagesRef
    });

    const { fetchAndSetHistory } = useFetchHistory({
        state,
        dispatch,
        userId,
        userImageUrl,
        t,
    });

    // 加载更多消息
    const loadMoreMessages = useCallback(() => {
        if (!state.isLoading && state.hasMore) {
            fetchAndSetHistory();
        }
    }, [state.isLoading, state.hasMore, fetchAndSetHistory]);

    // 重置新对话 ID
    const resetNewConversationId = useCallback(() => {
        dispatch({ type: 'RESET_NEW_CONVERSATION_ID' });
    }, [dispatch]);

    // 监听 initialConversationId 变化
    useEffect(() => {
        if (initialConversationId && initialConversationId !== state.conversationId) {
            dispatch({ type: 'SET_CONVERSATION_ID', payload: initialConversationId });
            dispatch({ type: 'CLEAR_MESSAGES' });
        }
    }, [initialConversationId, state.conversationId]);

    // 初始加载历史消息和重载触发
    useEffect(() => {
        fetchAndSetHistory();
    }, [fetchAndSetHistory, state.reloadConversationsCounter]);

    // 使用 useMemo 记忆化返回的对象
    const memoizedChat = useMemo(() => ({
        messages: state.messages,
        sendMessage,
        addMessage,
        triggerConversationsReload,
        reloadConversationsCounter: state.reloadConversationsCounter,
        newConversationId: state.newConversationId,
        resetNewConversationId,
        isLoading: state.isLoading,
        loadMoreMessages,
        isStreaming: state.isStreaming,
        stopStreaming,
        conversationId: state.conversationId,
    }), [
        state.messages,
        sendMessage,
        addMessage,
        triggerConversationsReload,
        state.reloadConversationsCounter,
        state.newConversationId,
        resetNewConversationId,
        state.isLoading,
        loadMoreMessages,
        state.isStreaming,
        stopStreaming,
        state.conversationId,
    ]);

    return memoizedChat;
};

export default useChat;
