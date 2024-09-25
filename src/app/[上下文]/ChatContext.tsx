// src/app/上下文/ChatContext.tsx

import React, {createContext, useContext, useState, useEffect} from 'react';
import {sendMessage as sendMessageAPI} from '@/app/[消息发送]/send_message';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {Message, StreamChunk, FinalInfo, SendMessageResponse, APIMessage} from '@/types/stream';

interface ChatContextProps {
    messages: Message[];
    sendMessage: (message: string, conversationId?: string) => void;
    addMessage: (message: Message) => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode; initialConversationId?: string }> = ({
                                                                                                          children,
                                                                                                          initialConversationId
                                                                                                      }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [chatTitle, setChatTitle] = useState<string | null>(null); // Optional chat title
    const [reloadConversationsCounter, setReloadConversationsCounter] = useState<number>(0);

    // 添加消息
    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    // 更新最后一条机器人消息的内容
    const updateLastBotMessage = (chunkContent: string) => {
        setMessages(prevMessages => {
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

    // 触发侧边栏重新加载
    const triggerConversationsReload = () => {
        setReloadConversationsCounter(prev => prev + 1);
    };

    // 拉取历史记录并设置消息
    useEffect(() => {
        const fetchAndSetHistory = async () => {
            if (!conversationId) return;

            try {
                const history = await fetchHistory({user_id: 'anonymous_user', conversation_id: conversationId});
                const formattedMessages: Message[] = history.messages.map((msg: APIMessage) => ({
                    id: msg.message_id,
                    type: msg.role === 'assistant' ? 'bot' : 'user',
                    content: msg.content,
                    avatarUrl: msg.role === 'assistant'
                        ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
                        : 'https://github.com/shuakami.png',
                    timestamp: msg.timestamp * 1000,
                })).sort((a, b) => a.timestamp - b.timestamp); // 按时间升序排序

                setMessages(formattedMessages);
            } catch (error) {
                console.error('无法加载历史记录', error);
                // 可选：设置错误状态或通知用户
            }
        };

        fetchAndSetHistory();
    }, [conversationId, reloadConversationsCounter]);

    // 发送消息
    const sendMessage = async (message: string, inputConversationId?: string) => {
        const activeConversationId = inputConversationId || conversationId;

        // 添加用户发送的消息
        addMessage({
            type: 'user',
            content: message,
            avatarUrl: 'https://github.com/shuakami.png',
        });

        // 添加一个占位的机器人消息
        const botMessage: Message = {
            type: 'bot',
            content: '',
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
        };
        addMessage(botMessage);

        try {
            await sendMessageAPI(
                {
                    user_input: message,
                    user_id: 'anonymous_user',
                    conversation_id: activeConversationId || undefined,
                },
                (initialResponse: SendMessageResponse) => {
                    // 处理初始响应，设置 conversation_id 和 chat_title
                    setConversationId(initialResponse.conversation_id);
                    if (initialResponse.chat_title) {
                        setChatTitle(initialResponse.chat_title);
                        // 触发侧边栏重新加载
                        triggerConversationsReload();
                    }
                },
                (chunk: StreamChunk) => {
                    // 更新最后一条机器人消息的内容
                    if (chunk.content) {
                        updateLastBotMessage(chunk.content);
                    }
                },
                (finalInfo: FinalInfo) => {
                    console.log('最终信息:', finalInfo);
                    // 可选：处理 final_info，例如统计信息
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

    return (
        <ChatContext.Provider
            value={{messages, sendMessage, addMessage, triggerConversationsReload, reloadConversationsCounter}}>
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
