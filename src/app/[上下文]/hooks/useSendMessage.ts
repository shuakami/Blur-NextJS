// src/app/[上下文]/useSendMessage.ts

import { useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { sendMessageAPI, stopStreamAPI } from '../api/chatAPI';
import { Message } from '@/types/stream';
import dialogProcessor from '../core/DialogProcessor';
import { updateLastBotMessageHandler } from '../core/messageHandlers';
import { Dispatch } from 'react';
import { Action } from '../core/chatReducer';

interface UseSendMessageProps {
    state: any;
    dispatch: Dispatch<Action>;
    addMessage: (message: Message) => void;
    triggerConversationsReload: () => void;
    t: (key: string) => string;
    userId?: string;
    userImageUrl?: string;
    messagesRef: React.MutableRefObject<Message[]>;
}

const useSendMessage = ({
    state,
    dispatch,
    addMessage,
    triggerConversationsReload,
    t,
    userId,
    userImageUrl,
    messagesRef,
}: UseSendMessageProps) => {
    const { getToken } = useAuth();
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (message: string, inputConversationId?: string) => {
        const activeConversationId = inputConversationId || state.conversationId;

        if (!userId) {
            addMessage(dialogProcessor.createErrorMessage(t('无法发送消息，用户未登录或未授权。')));
            return;
        }

        const userMessage = dialogProcessor.createUserMessage(message, userImageUrl);
        const botMessage = dialogProcessor.createBotMessage();

        addMessage(userMessage);
        addMessage(botMessage);

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_IS_STREAMING', payload: true });

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const token = await getToken();
            if (!token) {
                throw new Error(t('无法获取 JWT，用户未授权'));
            }

            let currentConversationId: string | null = activeConversationId;

            await sendMessageAPI({
                userInput: message,
                userId,
                token,
                conversationId: activeConversationId,
                onInitialResponse: (initialResponse) => {
                    currentConversationId = initialResponse.conversation_id;
                    if (!state.conversationId) {
                        dispatch({ type: 'SET_CONVERSATION_ID', payload: currentConversationId });
                    }
                },
                onChunk: (chunk) => {
                    if (chunk.content) {
                        dispatch({ type: 'SET_LOADING', payload: false });
                        updateLastBotMessageHandler(chunk.content, messagesRef.current, dispatch);
                    }
                
                    if (chunk.is_final_chunk) {
                        // 无论content是否为空，都重置isStreaming
                        const lastStreamingBotMessage = [...messagesRef.current].reverse().find(
                            (msg) => msg.type === 'bot' && msg.isStreaming
                        );
                        if (lastStreamingBotMessage) {
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: lastStreamingBotMessage.message_id,
                                    updates: {
                                        isStreaming: false
                                    }
                                }
                            });
                        }
                
                        dispatch({ type: 'RESET_NEW_CONVERSATION_ID' });
                        dispatch({ type: 'SET_IS_STREAMING', payload: false });
                        console.log('SET_IS_STREAMING', false);
                        triggerConversationsReload();
                    }
                },                
                onFinalInfo: (finalInfo) => {
                    console.log('最终信息:', finalInfo);
                },
                onError: (error) => {
                    console.error(t('后端错误:'), error);
                    addMessage(dialogProcessor.createErrorMessage(t('抱歉，发送消息失败。')));
                    dispatch({ type: 'SET_IS_STREAMING', payload: false });
                    dispatch({ type: 'SET_LOADING', payload: false });
                },
                signal: abortController.signal
            });
        } catch (error) {
            console.error(t('发送消息失败:'), error);
            addMessage(dialogProcessor.createErrorMessage(t('抱歉，发送消息失败。')));
            dispatch({ type: 'SET_IS_STREAMING', payload: false });
            dispatch({ type: 'SET_LOADING', payload: false });
        } finally {
            abortControllerRef.current = null;
        }
    }, [state.conversationId, userId, addMessage, t, userImageUrl, getToken, dispatch, triggerConversationsReload, messagesRef]);

    const stopStreaming = useCallback(async () => {
        if (!state.conversationId || !userId) {
            console.error('无法停止流式传输，缺少 conversationId 或 userId');
            return;
        }

        const lastBotMessage = [...messagesRef.current].reverse().find(
            (msg) => msg.type === 'bot' && msg.isStreaming
        );

        if (!lastBotMessage || !lastBotMessage.message_id) {
            console.error('无法停止流式传输，未找到正在 streaming 的消息');
            return;
        }

        try {
            await stopStreamAPI(state.conversationId, lastBotMessage.message_id, userId);

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            dispatch({ type: 'SET_IS_STREAMING', payload: false });
            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: lastBotMessage.message_id,
                    updates: { isStreaming: false }
                }
            });
        } catch (error) {
            console.error('停止流式传输失败:', error);
        }
    }, [state.conversationId, userId, dispatch, messagesRef]);

    return { sendMessage, stopStreaming };
};

export default useSendMessage;
