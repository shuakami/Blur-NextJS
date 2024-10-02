import React, {createContext, useContext, useState, useEffect} from 'react';
import {useUser, useAuth} from '@clerk/nextjs';
import {sendMessage as sendMessageAPI} from '@/app/[消息发送]/send_message';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {Message, StreamChunk, FinalInfo, SendMessageResponse, APIMessage} from '@/types/stream';
import useTranslation from "@/hooks/useTranslation";

interface ChatContextProps {
    messages: Message[];
    sendMessage: (message: string, conversationId?: string) => void;
    addMessage: (message: Message) => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;
    newConversationId: string | null;
    resetNewConversationId: () => void;
    isLoading?: boolean;
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
    }, [conversationId, initialConversationId]);

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
                // console.error(t('无法加载历史记录'), error);
            }
        };

        fetchAndSetHistory();
    }, [conversationId, reloadConversationsCounter, user?.imageUrl, userId]);

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

        setIsLoading(true); // 开始加载

        try {
            const token = await getToken();
            if (!token) {
                throw new Error(t('无法获取 JWT，用户未授权'));
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
                    currentConversationId = initialResponse.conversation_id;
                },
                (chunk: StreamChunk) => {
                    if (chunk.content) {
                        setIsLoading(false);
                        updateLastBotMessage(chunk.content);
                    }

                    if (chunk.is_final_chunk) {
                        setNewConversationId(currentConversationId);
                    }
                },
                (finalInfo: FinalInfo) => {
                    console.log('最终信息:', finalInfo);
                },
                (error: any) => {
                    console.error(t('后端错误:'), error);
                    updateLastBotMessage(t('抱歉，发送消息失败。'));
                    setIsLoading(false); // 出错时停止加载状态
                }
            );
        } catch (error) {
            console.error(t('发送消息失败:'), error);
            updateLastBotMessage(t('抱歉，发送消息失败。'));
            setIsLoading(false); // 出错时停止加载状态
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
