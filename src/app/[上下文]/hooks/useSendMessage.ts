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
    const currentBotMessageIdRef = useRef<string | null>(null);
    const currentBotContentRef = useRef<string>('');
    const lastPluginCallRef = useRef<{ id: number, name: string } | null>(null);

    // 核心发送消息逻辑
    const sendMessageCore = useCallback(async (
        message: string,
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
            // 更新现有消息的状态为 'pending'，清除之前的错误
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
            // 创建新的用户和机器人消息
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

        currentBotMessageIdRef.current = botMessage.message_id || null;
        currentBotContentRef.current = botMessage.content || '';

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
                        dispatch({ type: 'SET_NEW_CONVERSATION_ID', payload: currentConversationId });
                    }
                    
                    // 更新用户消息状态为已发送
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

                    // 增强错误识别逻辑
                    if ((chunk.status === 'error' && chunk.error) || (chunk.code && chunk.code >= 400)) {
                        console.error('检测到错误的 chunk:', chunk);
                        if (currentBotMessageIdRef.current) {
                            const errorDetails = {
                                code: chunk.code || 500,
                                message: chunk.message || t('抱歉，发送消息失败。')
                            };
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: currentBotMessageIdRef.current,
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

                        // 直接返回，不继续处理
                        return;
                    }

                    // 处理插件的流式检测
                    const result = dialogProcessor.processStreamChunk({
                        content: JSON.stringify(chunk),
                        currentFullContent: currentBotContentRef.current,
                        isFirstChunk: currentBotContentRef.current === '',
                        isFinalChunk: chunk.is_final_chunk
                    });

                    if (result?.updates && result.shouldUpdateCurrentBot && currentBotMessageIdRef.current) {
                        let content = currentBotContentRef.current;
                        
                        // 处理插件响应状态
                        if (result.updates.plugin_status === 'response' && lastPluginCallRef.current) {
                            // 移除对应的 calling 标记
                            const callMarker = `<plugin-data>{"status":"calling","plugin_id":${lastPluginCallRef.current.id},"plugin_name":"${lastPluginCallRef.current.name}"}</plugin-data>`;
                            content = content.replace(callMarker, '');
                            lastPluginCallRef.current = null;
                        }
                        
                        // 处理插件调用状态
                        if (result.updates.plugin_status === 'calling') {
                            lastPluginCallRef.current = {
                                id: result.updates.plugin_id!,
                                name: result.updates.plugin_name!
                            };
                        }

                        // 添加新的插件标记
                        const pluginInfo = {
                            status: result.updates.plugin_status,
                            plugin_id: result.updates.plugin_id,
                            plugin_name: result.updates.plugin_name,
                            plugin_response: result.updates.plugin_response
                        };
                        
                        const pluginMarker = `<plugin-data>${JSON.stringify(pluginInfo)}</plugin-data>`;
                        content += pluginMarker;
                        currentBotContentRef.current = content;
                        
                        dispatch({
                            type: 'UPDATE_MESSAGE',
                            payload: {
                                message_id: currentBotMessageIdRef.current,
                                updates: {
                                    ...result.updates,
                                    content
                                }
                            }
                        });
                    }

                    // 只有在有 content 时才更新消息内容
                    if (chunk.content) {
                        currentBotContentRef.current += chunk.content;
                        
                        if (currentBotMessageIdRef.current) {
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: currentBotMessageIdRef.current,
                                    updates: {
                                        content: currentBotContentRef.current
                                    }
                                }
                            });
                        }
                    }

                    if (chunk.is_final_chunk) {
                        if (currentBotMessageIdRef.current) {
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: currentBotMessageIdRef.current,
                                    updates: { isStreaming: false }
                                }
                            });
                        }

                        dispatch({ type: 'RESET_NEW_CONVERSATION_ID' });
                        dispatch({ type: 'SET_IS_STREAMING', payload: false });
                        console.log('SET_IS_STREAMING', false);
                        triggerConversationsReload();

                        // 重置 refs
                        currentBotMessageIdRef.current = null;
                        currentBotContentRef.current = '';
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

            // 成功发送后，无需操作
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
        currentBotMessageIdRef.current = null;
        currentBotContentRef.current = '';
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
                await sendMessageCore(userMessage.content, state.conversationId, 1, userMessage as MessageWithStatus, botMessage as MessageWithStatus);
            } else {
                // 如果找不到对应的机器人消息，可能需要手动创建或处理
                await sendMessageCore(userMessage.content, state.conversationId, 1, userMessage as MessageWithStatus, undefined);
            }

            console.log(`消息 ${messageId} 重试成功.`);
        } catch (error) {
            console.error('重试失败:', error);
            handleMessageError(error, userMessage as MessageWithStatus, botMessage as MessageWithStatus, 1);
        }
    }, [sendMessageCore, state.conversationId, dispatch, handleMessageError, messagesRef]);

    // 公开的发送消息接口
    const sendMessage = useCallback((message: string, inputConversationId?: string) => {
        return sendMessageCore(message, inputConversationId, 0);
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

        const botMessageId = currentBotMessageIdRef.current;

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

            // 重置 refs
            currentBotMessageIdRef.current = null;
            currentBotContentRef.current = '';
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
