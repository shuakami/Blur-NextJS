import { useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import useTranslation from "@/hooks/useTranslation";
import { Message, MessageStatus } from '@/types/stream';
import '@/app/[上下文]/plugins';

import { chatReducer, initialState } from '@/app/[上下文]/core/chatReducer';
import { addMessageHandler } from '@/app/[上下文]/core/messageHandlers';
import useFetchHistory from '@/app/[上下文]/hooks/useFetchHistory';
import useSendMessage from '@/app/[上下文]/hooks/useSendMessage';

// 返回类型
interface ChatReturn {
    // Message State
    messages: Message[];
    sendMessage: (message: string, model: string, conversationId?: string) => void;
    addMessage: (message: Message) => void;
    updateMessage: (messageId: string, updates: Partial<Message & { sendStatus?: MessageStatus }>) => void;
    clearMessages: () => void;
    clearFailedMessages: (userMessageId?: string, botMessageId?: string) => void;
    retryMessage: (messageId: string) => Promise<void>;

    // Conversation State
    conversationId: string | null;
    newConversationId: string | null;
    resetNewConversationId: () => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;

    // Chat State
    isLoading: boolean;
    isStreaming: boolean;
    hasMore: boolean;
    loadMoreMessages: () => void;
    stopStreaming?: () => void;
    resetChatState: () => void;
}

// 自定义 Hook
const useChat = (initialConversationId?: string): ChatReturn => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [state, dispatch] = useReducer(chatReducer, {
        ...initialState,
        conversationId: initialConversationId || null,
    });

    // 使用ref存储messages以确保在异步操作中获取最新值
    const messagesRef = useRef<Message[]>(state.messages);

    // 保持 messagesRef 同步最新的 messages
    useEffect(() => {
        messagesRef.current = state.messages;
        console.log('messagesRef 更新:', messagesRef.current);
    }, [state.messages]);

    // 缓存用户信息避免重复计算
    const userInfo = useMemo(() => ({
        userId: user?.id,
        userImageUrl: user?.imageUrl
    }), [user?.id, user?.imageUrl]);

    // 添加一个标志来追踪是否是新对话
    const isNewChat = useRef(false);

    // 添加消息
    const addMessage = useCallback((message: Message) => {
        addMessageHandler(message, dispatch);
    }, []);

    // 更新消息
    const updateMessage = useCallback((messageId: string, updates: Partial<Message & { sendStatus?: MessageStatus }>) => {
        dispatch({ type: 'UPDATE_MESSAGE', payload: { message_id: messageId, updates } });
    }, []);

    // 清除消息
    const clearMessages = useCallback(() => {
        dispatch({ type: 'CLEAR_MESSAGES' });
    }, []);

    // 清除失败的消息
    const clearFailedMessages = useCallback((userMessageId?: string, botMessageId?: string) => {
        dispatch({ type: 'CLEAR_FAILED_MESSAGES', payload: { userMessageId, botMessageId } });
    }, []);

    // 触发对话重载
    const triggerConversationsReload = useCallback(() => {
        dispatch({ type: 'INCREMENT_RELOAD_COUNTER' });
    }, []);

    // 使用自定义 Hooks
    const { 
        sendMessage, 
        stopStreaming, 
        retryMessage,
        getFailedMessages
    } = useSendMessage({
        state,
        dispatch,
        addMessage,
        triggerConversationsReload,
        t,
        ...userInfo,
        messagesRef,
    });

    const { fetchAndSetHistory } = useFetchHistory({
        state,
        dispatch,
        ...userInfo,
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
    }, []);

    // 监听 initialConversationId 变化
    useEffect(() => {
        if (initialConversationId && initialConversationId !== state.conversationId) {
            dispatch({ type: 'SET_CONVERSATION_ID', payload: initialConversationId });
            dispatch({ type: 'CLEAR_MESSAGES' });
        }
    }, [initialConversationId, state.conversationId]);

    // 修改初始加载历史消息和重载触发的逻辑
    useEffect(() => {
        // 只在以下条件下获取历史记录：
        // 1. 不是新对话
        // 2. 有对话ID
        // 3. 不是正在发送消息
        if (!isNewChat.current && state.conversationId && !state.isStreaming) {
            fetchAndSetHistory();
        }
    }, [fetchAndSetHistory, state.reloadConversationsCounter, state.conversationId, state.isStreaming]);

    // 监听 conversationId 变化
    useEffect(() => {
        // 如果是首次设置 conversationId，标记为新对话
        if (!state.conversationId && initialConversationId) {
            isNewChat.current = false;
        } else if (state.newConversationId) {
            isNewChat.current = true;
        }
    }, [state.conversationId, initialConversationId, state.newConversationId]);

    // 添加重置方法
    const resetChatState = useCallback(() => {
        dispatch({ type: 'CLEAR_MESSAGES' });
        dispatch({ type: 'SET_CONVERSATION_ID', payload: null });
        isNewChat.current = true;
    }, []);

    return {
        // Message State
        messages: state.messages,
        sendMessage,
        addMessage,
        updateMessage,
        clearMessages,
        clearFailedMessages,
        retryMessage,

        // Conversation State
        conversationId: state.conversationId,
        newConversationId: state.newConversationId,
        resetNewConversationId,
        triggerConversationsReload,
        reloadConversationsCounter: state.reloadConversationsCounter,

        // Chat State
        isLoading: state.isLoading,
        isStreaming: state.isStreaming,
        hasMore: state.hasMore,
        loadMoreMessages,
        stopStreaming,
        resetChatState,
    };
};

export default useChat;