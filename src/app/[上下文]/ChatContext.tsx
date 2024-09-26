// src/app/[上下文]/ChatContext.tsx
import React, {createContext, useContext, useState, useEffect} from 'react';
import {useUser, useAuth} from '@clerk/nextjs';
import {sendMessage as sendMessageAPI} from '@/app/[消息发送]/send_message';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {Message, StreamChunk, FinalInfo, SendMessageResponse, APIMessage} from '@/types/stream';

interface ChatContextProps {
    messages: Message[];
    sendMessage: (message: string, conversationId?: string) => void;
    addMessage: (message: Message) => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;
    newConversationId: string | null; // 新增新对话 ID
    resetNewConversationId: () => void; // 重置新对话 ID 的函数
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode; initialConversationId?: string }> = ({
                                                                                                          children,
                                                                                                          initialConversationId,
                                                                                                      }) => {
    const {user} = useUser();
    const {getToken} = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [chatTitle, setChatTitle] = useState<string | null>(null);
    const [newConversationId, setNewConversationId] = useState<string | null>(null); // 新对话 ID
    const [reloadConversationsCounter, setReloadConversationsCounter] = useState<number>(0);

    // 确保获取到用户 ID
    const userId = user?.id;

    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    const updateLastBotMessage = (chunkContent: string) => {
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].type === 'bot') {
                    updatedMessages[i] = {...updatedMessages[i], content: updatedMessages[i].content + chunkContent};
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
        }
    }, [initialConversationId]);

    useEffect(() => {
        const fetchAndSetHistory = async () => {
            if (!conversationId || !userId) return;

            try {
                const history = await fetchHistory({user_id: userId, conversation_id: conversationId});
                const formattedMessages: Message[] = history.messages.map((msg: APIMessage) => ({
                    id: msg.message_id,
                    type: msg.role === 'assistant' ? 'bot' : 'user',
                    content: msg.content,
                    avatarUrl: msg.role === 'assistant' ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix' : user?.imageUrl,
                    timestamp: msg.timestamp * 1000,
                    isStreaming: false,
                })).sort((a, b) => a.timestamp - b.timestamp);

                setMessages(formattedMessages);
            } catch (error) {
                console.error('无法加载历史记录', error);
            }
        };

        fetchAndSetHistory();
    }, [conversationId, reloadConversationsCounter, userId]);

    const sendMessage = async (message: string, inputConversationId?: string) => {
        const activeConversationId = inputConversationId || conversationId;

        if (!userId) {
            addMessage({
                type: 'error',
                content: '无法发送消息，用户未登录或未授权。',
                avatarUrl: '',
            });
            return;
        }

        addMessage({
            type: 'user',
            content: message,
            avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png',
        });

        const botMessage: Message = {
            type: 'bot',
            content: '',
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
        };
        addMessage(botMessage);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('无法获取 JWT，用户未授权');
            }

            let currentConversationId: string | null = activeConversationId;

            await sendMessageAPI(
                {
                    user_input: message,
                    user_id: userId,
                    conversation_id: activeConversationId || undefined,
                },
                token,
                (initialResponse: SendMessageResponse) => {
                    // 初始响应处理，但不设置 newConversationId，先记录对话ID
                    currentConversationId = initialResponse.conversation_id;
                    // console.log('初始响应，记录 currentConversationId:', currentConversationId);
                },
                (chunk: StreamChunk) => {
                    if (chunk.content) {
                        updateLastBotMessage(chunk.content);
                    }

                    // 只在流式输出结束时（即 is_final_chunk 为 true 时）设置对话 ID
                    if (chunk.is_final_chunk) {
                        // console.log('流式输出完成，设置 newConversationId:', currentConversationId);
                        setNewConversationId(currentConversationId);
                    }
                },
                (finalInfo: FinalInfo) => {
                    console.log('最终信息:', finalInfo);
                },
                (error: any) => {
                    console.error('后端错误:', error);
                    updateLastBotMessage('抱歉，发送消息失败。');
                }
            );
        } catch (error) {
            console.error('发送消息失败:', error);
            updateLastBotMessage('抱歉，发送消息失败。');
        }
    };


    // 重置新对话 ID 的函数
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
