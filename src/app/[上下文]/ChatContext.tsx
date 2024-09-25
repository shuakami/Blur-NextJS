import React, {createContext, useContext, useState, useEffect} from 'react';
import {useUser, useAuth} from '@clerk/nextjs'; // 使用 Clerk 的 useUser 获取用户信息
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
                                                                                                          initialConversationId,
                                                                                                      }) => {
    const {user} = useUser(); // 从 Clerk 获取用户信息
    const {getToken} = useAuth(); // 获取用户的 JWT
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [chatTitle, setChatTitle] = useState<string | null>(null); // 可选的对话标题
    const [reloadConversationsCounter, setReloadConversationsCounter] = useState<number>(0);

    // 确保获取到用户 ID
    const userId = user?.id;

    // 添加消息
    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    // 更新最后一条机器人消息的内容
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

    // 触发侧边栏重新加载
    const triggerConversationsReload = () => {
        setReloadConversationsCounter((prev) => prev + 1);
    };

    // 当初始对话 ID 改变时，重新加载历史记录
    useEffect(() => {
        if (initialConversationId !== conversationId) {
            setConversationId(initialConversationId || null);
            setMessages([]); // 清空当前消息，加载新对话
        }
    }, [initialConversationId]);

    // 拉取历史记录并设置消息
    useEffect(() => {
        const fetchAndSetHistory = async () => {
            if (!conversationId || !userId) return;

            try {
                const history = await fetchHistory({user_id: userId, conversation_id: conversationId});
                const formattedMessages: Message[] = history.messages.map((msg: APIMessage) => ({
                    id: msg.message_id,
                    type: msg.role === 'assistant' ? 'bot' : 'user',
                    content: msg.content,
                    avatarUrl:
                        msg.role === 'assistant'
                            ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
                            : 'https://github.com/shuakami.png',
                    timestamp: msg.timestamp * 1000,
                    isStreaming: false, // 历史消息不需要流式
                })).sort((a, b) => a.timestamp - b.timestamp); // 按时间升序排序

                setMessages(formattedMessages);
            } catch (error) {
                console.error('无法加载历史记录', error);
            }
        };

        fetchAndSetHistory();
    }, [conversationId, reloadConversationsCounter, userId]);

    // 发送消息
    const sendMessage = async (message: string, inputConversationId?: string) => {
        const activeConversationId = inputConversationId || conversationId;

        // 如果用户未登录或用户ID不存在，添加一条错误消息并返回
        if (!userId) {
            addMessage({
                type: 'error',
                content: '无法发送消息，用户未登录或未授权。',
                avatarUrl: '', // 错误消息没有头像
            });
            return;
        }

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
            // 获取 JWT
            const token = await getToken();
            if (!token) {
                throw new Error('无法获取 JWT，用户未授权');
            }

            await sendMessageAPI(
                {
                    user_input: message,
                    user_id: userId,
                    conversation_id: activeConversationId || undefined,
                },
                token, // 传入 JWT 令牌
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
            value={{messages, sendMessage, addMessage, triggerConversationsReload, reloadConversationsCounter}}
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
