import { useState, useCallback } from 'react';
import { Message, APIMessage } from '@/types/stream';
import { User } from '@clerk/nextjs/server';

export const useMessageHandler = (user: User | null) => {
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [isMessagesInitialized, setIsMessagesInitialized] = useState(false);

    const addMessage = useCallback((message: Message) => {
        setMessages((prev) => prev ? [message, ...prev] : [message]);
    }, []); 

    const updateLastBotMessage = useCallback((chunkContent: string) => {
        setMessages((prevMessages) => {
            if (!prevMessages) return null;
            const updatedMessages = [...prevMessages];
            for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].type === 'bot' && updatedMessages[i].isStreaming) {
                    updatedMessages[i] = {
                        ...updatedMessages[i],
                        content: updatedMessages[i].content + chunkContent,
                    };
                    break;
                }
            }
            return updatedMessages;
        });
    }, []);

    const formatHistoryMessages = useCallback((historyMessages: APIMessage[]): Message[] => {
        return historyMessages.map((msg: APIMessage): Message => ({
            id: msg.message_id,
            type: msg.role === 'assistant' ? 'bot' : 'user',
            content: msg.content,
            avatarUrl: msg.role === 'assistant' 
                ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix' 
                : (user?.imageUrl || 'https://github.com/shuakami.png'),
            timestamp: msg.timestamp * 1000,
            isStreaming: false,
            status: msg.status,
            parentId: msg.parent_id,
            childrenIds: msg.children_ids,
            version: msg.version,
            modified_count: msg.modified_count,
        }));
    }, [user?.imageUrl]);
    
    return {
        messages,
        setMessages,
        isMessagesInitialized,
        setIsMessagesInitialized,
        addMessage,
        updateLastBotMessage,
        formatHistoryMessages,
    };
}; 
