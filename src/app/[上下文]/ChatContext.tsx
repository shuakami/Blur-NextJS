// src/app/[上下文]/ChatContext.tsx
import React, {createContext, useContext, useState} from 'react';
import {sendMessage as sendMessageAPI} from '@/app/[消息发送]/send_message';
import {Message} from '@/app/[消息显示]/chat_list';
import {StreamMessage} from '@/components/ui/StreamMessage';

interface ChatContextProps {
    messages: Message[];
    sendMessage: (message: string) => void;
    addMessage: (message: Message) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [messages, setMessages] = useState<Message[]>([]);

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const sendMessage = async (message: string) => {
        // 添加用户发送的消息
        addMessage({
            type: 'user',
            content: message,
            avatarUrl: 'https://github.com/shuakami.png',
        });

        try {
            const response = await sendMessageAPI({
                user_input: message,
                user_id: 'anonymous_user',
                // conversation_id 可选，需根据上下文动态传入
            });

            // 处理流式响应
            // 在 `handleStream` 中，通过 Context 添加 bot 的消息
        } catch (error) {
            console.error('发送消息失败:', error);
            addMessage({
                type: 'bot',
                content: '抱歉，发送消息失败。',
                avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
            });
        }
    };

    return (
        <ChatContext.Provider value={{messages, sendMessage, addMessage}}>
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
