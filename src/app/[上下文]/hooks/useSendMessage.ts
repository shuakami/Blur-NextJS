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
    createMessageWithStatus,
    MessageStatus
} from '../core/messageStatus';
import { StreamMessageHandler } from '../core/StreamMessageHandler';

interface MessagePair {
    userMessage: MessageWithStatus;
    botMessage: MessageWithStatus;
}

interface MessageUpdatePayload {
    message_id: string;
    updates: Partial<MessageWithStatus>;
}

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
    const currentConversationIdRef = useRef<string | null>(null);

    // 状态更新工具
    const updateMessageStates = useCallback((updates: MessageUpdatePayload[]) => {
        updates.forEach(update => {
            dispatch({
                type: 'UPDATE_MESSAGE',
                payload: update
            });
        });
    }, [dispatch]);

    // 消息对初始化
    const initializeMessagePair = useCallback((
        message: string,
        existingPair?: { userMessage?: MessageWithStatus; botMessage?: MessageWithStatus }
    ): MessagePair => {
        if (existingPair?.userMessage && existingPair?.botMessage) {
            const userMessage = { 
                ...existingPair.userMessage, 
                sendStatus: 'pending' as MessageStatus, 
                error: undefined 
            };
            const botMessage = { 
                ...existingPair.botMessage, 
                sendStatus: 'pending' as MessageStatus, 
                error: undefined, 
                content: '' 
            };

            updateMessageStates([
                {
                    message_id: userMessage.message_id!,
                    updates: { sendStatus: 'pending', error: undefined }
                },
                {
                    message_id: botMessage.message_id!,
                    updates: { sendStatus: 'pending', error: undefined, content: '' }
                }
            ]);

            return { userMessage, botMessage };
        }

        const userMessage = createMessageWithStatus(
            dialogProcessor.createUserMessage(message, userImageUrl),
            'pending'
        );
        const botMessage = createMessageWithStatus(
            dialogProcessor.createBotMessage(),
            'pending'
        );

        addMessage(userMessage as Message);
        addMessage(botMessage as Message);

        return { userMessage, botMessage };
    }, [addMessage, updateMessageStates, userImageUrl]);

    // 流处理状态管理
    const handleStreamState = useCallback((
        botMessageId: string | null,
        content: string = '',
        isStreaming: boolean = true
    ) => {
        streamHandler.current.setCurrentBotMessageId(botMessageId);
        streamHandler.current.setCurrentBotContent(content);
        dispatch({ type: 'SET_IS_STREAMING', payload: isStreaming });
    }, [dispatch]);

    // 错误处理
    const handleMessageError = useCallback((
        error: any,
        messagePair: MessagePair
    ) => {
        console.error(t('发送消息失败:'), error);

        const errorDetails = {
            code: error.code || 500,
            message: error.message || t('抱歉，发送消息失败。')
        };

        const updates: MessageUpdatePayload[] = [];

        if (messagePair.userMessage.message_id) {
            updates.push({
                message_id: messagePair.userMessage.message_id,
                updates: { 
                    sendStatus: 'failed',
                    error: errorDetails
                }
            });
        }

        if (messagePair.botMessage.message_id) {
            updates.push({
                message_id: messagePair.botMessage.message_id,
                updates: { 
                    sendStatus: 'failed',
                    error: errorDetails,
                    isStreaming: false
                }
            });
        }

        updateMessageStates(updates);
        dispatch({ type: 'SET_IS_STREAMING', payload: false });
        dispatch({ type: 'SET_LOADING', payload: false });
    }, [dispatch, t, updateMessageStates]);

    // [CORE] 发送消息逻辑
    const sendMessageCore = useCallback(async (
        message: string,
        model: string,
        inputConversationId?: string,
        existingPair?: { userMessage?: MessageWithStatus; botMessage?: MessageWithStatus }
    ) => {
        if (!userId) {
            addMessage(dialogProcessor.createErrorMessage(t('无法发送消息，用户未登录或未授权。')));
            return;
        }

        const activeConversationId = inputConversationId || state.conversationId;
        const messagePair = initializeMessagePair(message, existingPair);
        
        handleStreamState(messagePair.botMessage.message_id || null);
        dispatch({ type: 'SET_LOADING', payload: true });

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
                    const conversationId = initialResponse.conversation_id;
                    if (!state.conversationId) {
                        currentConversationIdRef.current = conversationId;
                        
                        dispatch({ type: 'SET_CONVERSATION_ID', payload: conversationId });
                        dispatch({ type: 'SET_NEW_CONVERSATION_ID', payload: conversationId });
                        
                        console.log('设置新对话ID:', conversationId);
                        
                        // 触发新对话事件，使用后端返回的标题
                        const newConversationEvent = new CustomEvent('addConversation', {
                            detail: {
                                conversation_id: conversationId,
                                chat_title: initialResponse.chat_title || "新对话",
                                timestamp: Date.now()
                            }
                        });
                        window.dispatchEvent(newConversationEvent);
                    }
                    
                    if (messagePair.userMessage.message_id) {
                        updateMessageStates([{
                            message_id: messagePair.userMessage.message_id,
                            updates: { sendStatus: 'sent' }
                        }]);
                    }
                },
                onChunk: (chunk) => {
                    dispatch({ type: 'SET_LOADING', payload: false });

                    if ((chunk.status === 'error' && chunk.error) || (chunk.code && chunk.code >= 400)) {
                        console.error('检测到错误的 chunk:', chunk);
                        handleMessageError({ 
                            code: chunk.code || 500,
                            message: chunk.message || t('抱歉，发送消息失败。')
                        }, messagePair);
                        return;
                    }

                    streamHandler.current.handleStreamChunk(chunk);

                    if (chunk.is_final_chunk) {
                        const currentBotMessageId = streamHandler.current.getCurrentBotMessageId();
                        if (currentBotMessageId) {
                            updateMessageStates([{
                                message_id: currentBotMessageId,
                                updates: { isStreaming: false }
                            }]);
                        }

                        dispatch({ type: 'RESET_NEW_CONVERSATION_ID' });
                        handleStreamState(null, '', false);
                        streamHandler.current.resetState();
                    }
                },
                onFinalInfo: (finalInfo) => {
                    console.log('收到最终信息:', finalInfo);
                    
                    if (finalInfo?.chat_title) {
                        const conversationId = currentConversationIdRef.current;
                        
                        if (!conversationId) {
                            console.error('无法更新标题：conversationId 为空');
                            return;
                        }
                        
                        const updateTitleEvent = new CustomEvent('updateConversationTitle', {
                            detail: {
                                conversation_id: conversationId,
                                chat_title: finalInfo.chat_title,
                                timestamp: Date.now()
                            }
                        });
                        window.dispatchEvent(updateTitleEvent);
                    }
                },
                onError: (error) => {
                    console.error('onError 被调用:', error);
                    handleMessageError(error, messagePair);
                },
                signal: abortController.signal
            });

        } catch (error: any) {
            handleMessageError(error, messagePair);
        } finally {
            abortControllerRef.current = null;
        }
    }, [
        state.conversationId,
        userId,
        addMessage,
        t,
        getToken,
        dispatch,
        triggerConversationsReload,
        handleStreamState,
        handleMessageError,
        initializeMessagePair
    ]);

    // 重试消息
    const retryMessage = useCallback(async (messageId: string) => {
        const messageIndex = messagesRef.current.findIndex(
            msg => msg.message_id === messageId && 
            msg.sendStatus === 'failed' && 
            msg.type === 'user'
        );

        if (messageIndex === -1) {
            console.log(`消息 ${messageId} 无法重试，因为未找到可重试的消息`);
            return;
        }

        const userMessage = messagesRef.current[messageIndex];
        const botMessage = messagesRef.current[messageIndex + 1]?.type === 'bot' 
            ? messagesRef.current[messageIndex + 1] 
            : undefined;

        try {
            await sendMessageCore(
                userMessage.content,
                userMessage.model || 'claude',
                state.conversationId,
                { 
                    userMessage: userMessage as MessageWithStatus,
                    botMessage: botMessage as MessageWithStatus 
                }
            );
        } catch (error) {
            console.error('重试失败:', error);
            handleMessageError(
                error, 
                { 
                    userMessage: userMessage as MessageWithStatus,
                    botMessage: botMessage as MessageWithStatus 
                }
            );
        }
    }, [sendMessageCore, state.conversationId, handleMessageError, messagesRef]);

    // 获取失败的消息
    const getFailedMessages = useCallback((): RetryableMessage[] => {
        return messagesRef.current.reduce((acc: RetryableMessage[], msg, index) => {
            if (msg.sendStatus === 'failed' && msg.type === 'user') {
                const botMessage = messagesRef.current[index + 1];
                acc.push({
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
            return acc;
        }, []);
    }, [messagesRef]);

    // 停止流式传输
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

            handleStreamState(botMessageId, undefined, false);
            updateMessageStates([{
                message_id: botMessageId,
                updates: { isStreaming: false }
            }]);

            streamHandler.current.resetState();
        } catch (error) {
            console.error('停止流式传输失败:', error);
        }
    }, [state.conversationId, userId, handleStreamState, updateMessageStates]);

    // 公开接口
    const sendMessage = useCallback((message: string, model: string) => {
        return sendMessageCore(message, model);
    }, [sendMessageCore]);

    return { 
        sendMessage, 
        stopStreaming,
        retryMessage,
        getFailedMessages
    };
};

export default useSendMessage;