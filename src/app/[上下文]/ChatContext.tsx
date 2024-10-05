// src/app/contexts/ChatContext.tsx

import React, {createContext, useContext, useState, useEffect, useRef, useCallback} from 'react';
import {useUser, useAuth} from '@clerk/nextjs';
import {sendMessage as sendMessageAPI} from '@/app/[消息发送]/send_message';
import {stopStream as stopStreamAPI} from '@/app/[对话管理]/stop_stream'; // 引入停止流式传输的 API
import {Message, StreamChunk, FinalInfo, SendMessageResponse, APIMessage} from '@/types/stream';
import useTranslation from "@/hooks/useTranslation";
import {fetchHistory} from "@/app/[拉取历史]/fetch_history";

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
    const {t} = useTranslation();
    const {user} = useUser();
    const {getToken} = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [newConversationId, setNewConversationId] = useState<string | null>(null); // 新对话 ID
    const [reloadConversationsCounter, setReloadConversationsCounter] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false); // 加载状态
    const [hasMore, setHasMore] = useState<boolean>(true); // 是否有更多消息
    const [offset, setOffset] = useState<number>(0); // 偏移量
    const limit = 10; // 每次加载的消息数量
    const [isStreaming, setIsStreaming] = useState<boolean>(false); // 是否正在流式传输
    const abortControllerRef = useRef<AbortController | null>(null); // 用于停止流式传输

    const userId = user?.id;

    const addMessage = (message: Message) => {
        setMessages((prev) => [message, ...prev]); // 新消息添加到顶部
    };

    const updateLastBotMessage = (chunkContent: string) => {
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            // 只更新最后一个正在 streaming 的 bot 消息
            for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].type === 'bot' && updatedMessages[i].isStreaming) {
                    updatedMessages[i] = {
                        ...updatedMessages[i],
                        content: updatedMessages[i].content + chunkContent, // 拼接新内容
                    };
                    break;
                }
            }
            return updatedMessages;
        });
    };

    const triggerConversationsReload = () => {
        setReloadConversationsCounter((prev) => prev + 1);
    };

    useEffect(() => {
        if (initialConversationId !== conversationId) {
            setConversationId(initialConversationId || null);
            setMessages([]);
            setNewConversationId(null); // 重置新对话 ID
            setOffset(0);
            setHasMore(true);
        }
    }, [conversationId, initialConversationId]);

    const fetchAndSetHistory = useCallback(async () => {
        if (!conversationId || !userId || !hasMore) return;

        setIsLoading(true);

        try {
            const history = await fetchHistory({
                user_id: userId,
                conversation_id: conversationId,
                limit,
                offset,
            });

            const formattedMessages: Message[] = history.messages.map((msg: APIMessage) => ({
                id: msg.message_id,
                type: msg.role === 'assistant' ? 'bot' : 'user',
                content: msg.content,
                avatarUrl: msg.role === 'assistant' ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix' : user?.imageUrl,
                timestamp: msg.timestamp * 1000,
                isStreaming: false,
            }));

            if (formattedMessages.length < limit) {
                setHasMore(false);
            }

            // 正常顺序显示消息，无需 reverse
            setMessages((prev) => [...prev, ...formattedMessages]);
            setOffset((prev) => prev + limit);
        } catch (error) {
            console.error(t('无法加载历史记录'), error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, userId, offset, limit, hasMore, t, user?.imageUrl]);

    useEffect(() => {
        fetchAndSetHistory();
    }, [fetchAndSetHistory]);

    const sendMessage = async (message: string, inputConversationId?: string) => {
        const activeConversationId = inputConversationId || conversationId;

        if (!userId) {
            addMessage({
                type: 'error',
                content: t('无法发送消息，用户未登录或未授权。'),
                avatarUrl: '',
            });
            return;
        }

        const userMessage: Message = {
            type: 'user',
            content: message,
            avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png',
        };
        // 将用户消息添加到底部
        setMessages((prev) => [...prev, userMessage]);

        const botMessage: Message = {
            type: 'bot',
            content: '',
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
            isStreaming: true, // 表示 bot 消息正在 streaming
        };
        // 预先将一个空的 bot 消息添加到底部
        setMessages((prev) => [...prev, botMessage]);

        setIsLoading(true);
        setIsStreaming(true);

        // 创建 AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const token = await getToken();
            if (!token) {
                throw new Error(t('无法获取 JWT，用户未授权'));
            }

            let currentConversationId: string | null = activeConversationId;
            let currentMessageId: string | null | undefined = null; // 用于停止流式传输

            await sendMessageAPI(
                {
                    user_input: message,
                    user_id: userId,
                    conversation_id: activeConversationId || undefined,
                },
                token,
                (initialResponse: SendMessageResponse) => {
                    currentConversationId = initialResponse.conversation_id;
                    currentMessageId = initialResponse.message_id;
                    if (!conversationId) {
                        setConversationId(currentConversationId);
                    }
                },
                (chunk: StreamChunk) => {
                    if (chunk.content) {
                        setIsLoading(false);
                        updateLastBotMessage(chunk.content);  // 更新最后的 bot 消息内容
                    }

                    if (chunk.is_final_chunk) {
                        // 标记最后一个 bot 消息结束 streaming
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages];
                            for (let i = updatedMessages.length - 1; i >= 0; i--) {
                                if (updatedMessages[i].type === 'bot' && updatedMessages[i].isStreaming) {
                                    updatedMessages[i] = {
                                        ...updatedMessages[i],
                                        isStreaming: false, // 结束 streaming
                                    };
                                    break;
                                }
                            }
                            return updatedMessages;
                        });

                        setIsStreaming(false);
                        setNewConversationId(currentConversationId);
                        triggerConversationsReload();
                    }
                },
                (finalInfo: FinalInfo) => {
                    console.log('最终信息:', finalInfo);
                },
                (error: any) => {
                    console.error(t('后端错误:'), error);
                    updateLastBotMessage(t('抱歉，发送消息失败。'));
                    setIsStreaming(false);
                    setIsLoading(false);
                },
                abortController.signal // 传入 AbortSignal
            );
        } catch (error) {
            console.error(t('发送消息失败:'), error);
            updateLastBotMessage(t('抱歉，发送消息失败。'));
            setIsStreaming(false);
            setIsLoading(false);
        } finally {
            abortControllerRef.current = null;
        }
    };

    const stopStreaming = async () => {
        if (!conversationId || !userId) {
            console.error('无法停止流式传输，缺少 conversationId 或 userId');
            return;
        }

        // 获取最后一个正在 streaming 的消息
        const lastBotMessage = messages.slice().reverse().find((msg) => msg.type === 'bot' && msg.isStreaming);

        if (!lastBotMessage) {
            console.error('无法停止流式传输，未找到正在 streaming 的消息');
            return;
        }

        // 调用后端停止流式传输的 API
        try {
            await stopStreamAPI(conversationId, lastBotMessage.id || '', userId);

            // 中止请求
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // 更新状态
            setIsStreaming(false);

            // 标记最后一个 bot 消息结束 streaming
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                for (let i = updatedMessages.length - 1; i >= 0; i--) {
                    if (updatedMessages[i].type === 'bot' && updatedMessages[i].isStreaming) {
                        updatedMessages[i] = {
                            ...updatedMessages[i],
                            isStreaming: false, // 结束 streaming
                        };
                        break;
                    }
                }
                return updatedMessages;
            });
        } catch (error) {
            console.error('停止流式传输失败:', error);
        }
    };

    // 加载更多消息的函数
    const loadMoreMessages = () => {
        if (!isLoading && hasMore) {
            fetchAndSetHistory();
        }
    };

    const resetNewConversationId = () => {
        setNewConversationId(null);
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                sendMessage,
                addMessage,
                triggerConversationsReload,
                reloadConversationsCounter,
                newConversationId,
                resetNewConversationId,
                isLoading,
                loadMoreMessages,
                isStreaming,
                stopStreaming,
                conversationId,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext 必须在 ChatProvider 内使用');
    }
    return context;
};
