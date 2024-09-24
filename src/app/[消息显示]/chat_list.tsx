// src/app/[消息显示]/chat_list.tsx
import React, {useEffect, useState} from 'react';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {sendMessage} from '@/app/[消息发送]/send_message';
import {ChatList as UIChatList} from '@/components/ui/chat-list';
import {StreamMessage} from '@/components/ui/StreamMessage';

interface ChatListProps {
    user_id: string;
    conversation_id?: string;
    tempMessage?: Message; // 临时消息发送传入
}

interface Message {
    type: string; // 'bot' | 'user'
    content: string;
    avatarUrl?: string;
}

const ChatList: React.FC<ChatListProps> = ({user_id, conversation_id, tempMessage}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversation_id);
    const [streaming, setStreaming] = useState<boolean>(false);

    useEffect(() => {
        const getHistory = async () => {
            if (!currentConversationId) return;
            setLoading(true);
            try {
                const history = await fetchHistory({user_id, conversation_id: currentConversationId});
                const formattedMessages = history.messages.map(msg => ({
                    type: msg.role === 'assistant' ? 'bot' : 'user',
                    content: msg.content,
                    avatarUrl: msg.role === 'assistant'
                        ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
                        : 'https://github.com/shuakami.png',
                }));
                setMessages(formattedMessages);
            } catch (err) {
                setError('无法加载历史记录');
            } finally {
                setLoading(false);
            }
        };

        getHistory();
    }, [user_id, currentConversationId]);

    const handleSendMessage = async (message: string) => {
        try {
            setStreaming(true);
            const response = await sendMessage({
                user_input: message,
                user_id,
                conversation_id: currentConversationId,
            });
            if (response.conversation_id) {
                setCurrentConversationId(response.conversation_id);
            }
            // 处理流式响应将由 stream.tsx 中的 handleStream 处理
        } catch (err) {
            console.error('发送消息失败:', err);
            setError('发送消息失败');
        } finally {
            setStreaming(false);
        }
    };

    // 处理临时消息（如果有）
    useEffect(() => {
        if (tempMessage) {
            setMessages(prev => [...prev, tempMessage]);
        }
    }, [tempMessage]);

    if (loading) return <div>加载中...</div>;
    if (error) return <div>{error}</div>;

    return (
        <UIChatList messages={messages}>
            {streaming && <StreamMessage/>}
        </UIChatList>
    );
};

export default ChatList;
