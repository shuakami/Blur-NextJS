// src/app/[上下文]/useSendMessage.ts

import { useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { sendMessageAPI, stopStreamAPI } from '../api/chatAPI';
import { Message } from '@/types/stream';
import dialogProcessor from '../core/DialogProcessor';
import { Dispatch } from 'react';
import { Action } from '../core/chatReducer';
import { 
    MessageWithStatus, 
    RetryableMessage,
    createMessageWithStatus 
} from '../core/messageStatus';
import { StreamMessageHandler } from '../core/StreamMessageHandler';

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
    const streamHandler = useRef<StreamMessageHandler>(new StreamMessageHandler(dispatch));

    // 核心发送消息逻辑
    const sendMessageCore = useCallback(async (
        message: string,
        model: string,
        inputConversationId?: string,
        retryCount: number = 0,
        existingUserMessage?: MessageWithStatus,
        existingBotMessage?: MessageWithStatus
    ) => {
        if (!userId) {
            addMessage(dialogProcessor.createErrorMessage(t('无法发送消息，用户未登录或未授权。')));
            return;
        }

        const activeConversationId = inputConversationId || state.conversationId;

        let userMessage: MessageWithStatus;
        let botMessage: MessageWithStatus;

        if (retryCount > 0 && existingUserMessage && existingBotMessage) {
            userMessage = { ...existingUserMessage, sendStatus: 'pending', error: undefined };
            botMessage = { ...existingBotMessage, sendStatus: 'pending', error: undefined, content: '' };

            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: userMessage.message_id,
                    updates: { sendStatus: 'pending', error: undefined }
                }
            });

            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: botMessage.message_id,
                    updates: { sendStatus: 'pending', error: undefined, content: '' }
                }
            });
        } else {
            userMessage = createMessageWithStatus(
                dialogProcessor.createUserMessage(message, userImageUrl),
                'pending'
            );
            botMessage = createMessageWithStatus(
                dialogProcessor.createBotMessage(),
                'pending'
            );

            addMessage(userMessage as Message);
            addMessage(botMessage as Message);
        }

        streamHandler.current.setCurrentBotMessageId(botMessage.message_id || null);
        streamHandler.current.setCurrentBotContent(botMessage.content || '');

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_IS_STREAMING', payload: true });

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const token = await getToken();
            if (!token) {
                throw new Error(t('无法获取 JWT，用户未授权'));
            }

            await sendMessageAPI({
                userInput: message,
                userId,
                token,
                conversationId: activeConversationId,
                model: model,
                onInitialResponse: (initialResponse) => {
                    if (!state.conversationId) {
                        dispatch({ type: 'SET_CONVERSATION_ID', payload: initialResponse.conversation_id });
                        dispatch({ type: 'SET_NEW_CONVERSATION_ID', payload: initialResponse.conversation_id });
                    }
                    
                    if (userMessage.message_id) {
                        dispatch({
                            type: 'UPDATE_MESSAGE',
                            payload: {
                                message_id: userMessage.message_id,
                                updates: { sendStatus: 'sent' }
                            }
                        });
                    }
                },
                onChunk: (chunk) => {
                    dispatch({ type: 'SET_LOADING', payload: false });

                    if ((chunk.status === 'error' && chunk.error) || (chunk.code && chunk.code >= 400)) {
                        console.error('检测到错误的 chunk:', chunk);
                        const currentBotMessageId = streamHandler.current.getCurrentBotMessageId();
                        if (currentBotMessageId) {
                            const errorDetails = {
                                code: chunk.code || 500,
                                message: chunk.message || t('抱歉，发送消息失败。')
                            };
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: currentBotMessageId,
                                    updates: {
                                        error: errorDetails,
                                        isStreaming: false,
                                        sendStatus: 'failed'
                                    }
                                }
                            });
                        }
                        dispatch({ type: 'SET_IS_STREAMING', payload: false });
                        dispatch({ type: 'SET_LOADING', payload: false });
                        return;
                    }

                    streamHandler.current.handleStreamChunk(chunk);

                    if (chunk.is_final_chunk) {
                        const currentBotMessageId = streamHandler.current.getCurrentBotMessageId();
                        if (currentBotMessageId) {
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: currentBotMessageId,
                                    updates: { isStreaming: false }
                                }
                            });
                        }

                        dispatch({ type: 'RESET_NEW_CONVERSATION_ID' });
                        dispatch({ type: 'SET_IS_STREAMING', payload: false });
                        triggerConversationsReload();

                        streamHandler.current.resetState();
                    }
                },
                onFinalInfo: (finalInfo) => {
                    console.log('最终信息:', finalInfo);
                },
                onError: (error) => {
                    console.error('onError 被调用:', error);
                    handleMessageError(error, userMessage, botMessage, retryCount);
                },
                signal: abortController.signal
            });

        } catch (error: any) {
            handleMessageError(error, userMessage, botMessage, retryCount);
        } finally {
            abortControllerRef.current = null;
        }
    }, [
        state.conversationId,
        userId,
        addMessage,
        t,
        userImageUrl,
        getToken,
        dispatch,
        triggerConversationsReload,
    ]);

    // 错误处理函数
    const handleMessageError = useCallback((
        error: any,
        userMessage: MessageWithStatus,
        botMessage: MessageWithStatus,
        retryCount: number
    ) => {
        console.error(t('发送消息失败:'), error);

        const errorDetails = {
            code: error.code || 500,
            message: error.message || t('抱歉，发送消息失败。')
        };

        // 更新用户消息状态为 'failed'
        if (userMessage.message_id) {
            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: userMessage.message_id,
                    updates: { 
                        sendStatus: 'failed',
                        error: errorDetails
                    }
                }
            });
        }

        // 更新机器人消息状态为 'failed'
        if (botMessage.message_id) {
            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: botMessage.message_id,
                    updates: { 
                        sendStatus: 'failed',
                        error: errorDetails,
                        isStreaming: false
                    }
                }
            });
        }

        dispatch({ type: 'SET_IS_STREAMING', payload: false });
        dispatch({ type: 'SET_LOADING', payload: false });
    }, [dispatch, t]);

    // 重试消息
    const retryMessage = useCallback(async (messageId: string) => {
        console.log(`尝试重试消息: ${messageId}`);
        // 找到需要重试的用户消息
        const messageIndex = messagesRef.current.findIndex(msg => msg.message_id === messageId && msg.sendStatus === 'failed' && msg.type === 'user');
        if (messageIndex === -1) {
            console.log(`消息 ${messageId} 无法重试，因为未找到可重试的消息`);
            return;
        }

        const userMessage = messagesRef.current[messageIndex];
        const botMessage = messagesRef.current[messageIndex + 1] && messagesRef.current[messageIndex + 1].type === 'bot' ? messagesRef.current[messageIndex + 1] : undefined;

        try {
            if (botMessage) {
                await sendMessageCore(
                    userMessage.content,
                    userMessage.model || 'claude',
                    state.conversationId,
                    1,
                    userMessage as MessageWithStatus,
                    botMessage as MessageWithStatus
                );
            } else {
                await sendMessageCore(
                    userMessage.content,
                    userMessage.model || 'claude',
                    state.conversationId,
                    1,
                    userMessage as MessageWithStatus,
                    undefined
                );
            }

            console.log(`消息 ${messageId} 重试成功.`);
        } catch (error) {
            console.error('重试失败:', error);
            handleMessageError(error, userMessage as MessageWithStatus, botMessage as MessageWithStatus, 1);
        }
    }, [sendMessageCore, state.conversationId, handleMessageError, messagesRef]);

    // 公开的发送消息接口
    const sendMessage = useCallback((message: string, model: string) => {
        return sendMessageCore(message, model);
    }, [sendMessageCore]);

    // 获取失败的消息
    const getFailedMessages = useCallback((): RetryableMessage[] => {
        const failedMessages: RetryableMessage[] = [];
        
        messagesRef.current.forEach((msg, index) => {
            if (msg.sendStatus === 'failed' && msg.type === 'user') {
                const botMessage = messagesRef.current[index + 1];
                failedMessages.push({
                    message_id: msg.message_id || '',
                    type: msg.type,
                    content: msg.content,
                    sendStatus: msg.sendStatus || 'failed',
                    retryCount: msg.retryCount || 0,
                    error: msg.error,
                    userMessage: msg,
                    botMessage: botMessage?.type === 'bot' ? botMessage : undefined
                });
            }
        });
        
        return failedMessages;
    }, [messagesRef]);

    const stopStreaming = useCallback(async () => {
        if (!state.conversationId || !userId) {
            console.error('无法停止流式传输，缺少 conversationId 或 userId');
            return;
        }

        const botMessageId = streamHandler.current.getCurrentBotMessageId();

        if (!botMessageId) {
            console.error('无法停止流式传输，未找到正在 streaming 的消息');
            return;
        }

        try {
            await stopStreamAPI(state.conversationId, botMessageId, userId);

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            dispatch({ type: 'SET_IS_STREAMING', payload: false });
            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: botMessageId,
                    updates: { isStreaming: false }
                }
            });

            streamHandler.current.resetState();
        } catch (error) {
            console.error('停止流式传输失败:', error);
        }
    }, [state.conversationId, userId, dispatch]);

    return { 
        sendMessage, 
        stopStreaming,
        retryMessage,
        getFailedMessages
    };
};

export default useSendMessage;
