// src/app/[上下文]/useSendMessage.ts

import { useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { sendMessageAPI, stopStreamAPI } from '../api/chatAPI';
import { Message } from '@/types/stream';
import dialogProcessor from '../core/DialogProcessor';
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
    // 保留 messagesRef 以防其他用途
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
    const currentBotMessageIdRef = useRef<string | null>(null); // 存储当前流式传输的机器人消息ID
    const currentBotContentRef = useRef<string>(''); // 存储当前机器人消息的内容
    const lastPluginCallRef = useRef<{ id: number, name: string } | null>(null);

    const sendMessage = useCallback(async (message: string, inputConversationId?: string) => {
        const activeConversationId = inputConversationId || state.conversationId;

        if (!userId) {
            addMessage(dialogProcessor.createErrorMessage(t('无法发送消息，用户未登录或未授权。')));
            return;
        }

        const userMessage = dialogProcessor.createUserMessage(message, userImageUrl);
        const botMessage = dialogProcessor.createBotMessage();

        // 添加用户消息和机器人消息
        addMessage(userMessage);
        addMessage(botMessage);

        // 捕获当前机器人消息的ID和初始化内容
        const botMessageId = botMessage.message_id;
        currentBotMessageIdRef.current = botMessageId || null;
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
                },
                onChunk: (chunk) => {
                    dispatch({ type: 'SET_LOADING', payload: false });

                    // 1. 更新 chunk 错误处理
                    if (chunk.status === 'error' && chunk.error) {
                        if (currentBotMessageIdRef.current) {
                            dispatch({
                                type: 'UPDATE_MESSAGE',
                                payload: {
                                    message_id: currentBotMessageIdRef.current,
                                    updates: {
                                        error: {
                                            code: chunk.error.code,
                                            message: chunk.error.message
                                        },
                                        isStreaming: false
                                    }
                                }
                            });
                        }
                        dispatch({ type: 'SET_IS_STREAMING', payload: false });
                        dispatch({ type: 'SET_LOADING', payload: false });
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
                    console.error(t('后端错误:'), error);
                    if (currentBotMessageIdRef.current) {
                        dispatch({
                            type: 'UPDATE_MESSAGE',
                            payload: {
                                message_id: currentBotMessageIdRef.current,
                                updates: {
                                    error: {
                                        code: error.code || 500,
                                        message: error.message || t('抱歉，发送消息失败。')
                                    },
                                    isStreaming: false
                                }
                            }
                        });
                    }
                    dispatch({ type: 'SET_IS_STREAMING', payload: false });
                    dispatch({ type: 'SET_LOADING', payload: false });
                    currentBotMessageIdRef.current = null;
                    currentBotContentRef.current = '';
                },
                signal: abortController.signal
            });
        } catch (error: any) {
            console.error(t('发送消息失败:'), error);
            if (currentBotMessageIdRef.current) {
                dispatch({
                    type: 'UPDATE_MESSAGE',
                    payload: {
                        message_id: currentBotMessageIdRef.current,
                        updates: {
                            error: {
                                code: error.code || 500,
                                message: error.message || t('抱歉，发送消息失败。')
                            },
                            isStreaming: false
                        }
                    }
                });
            }
            dispatch({ type: 'SET_IS_STREAMING', payload: false });
            dispatch({ type: 'SET_LOADING', payload: false });
            currentBotMessageIdRef.current = null;
            currentBotContentRef.current = '';
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
        // 移除 messagesRef 作为依赖，避免闭包捕获问题
    ]);

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

    return { sendMessage, stopStreaming };
};

export default useSendMessage;
