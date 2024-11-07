// contexts/ConversationsContext.tsx
"use client";

import React, {createContext, useState, ReactNode, useContext} from 'react';

interface Conversation {
    conversation_id: string;
    chat_title: string | null;
    timestamp: number;
}

interface ConversationsContextType {
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    removeConversation: (conversationId: string) => void;
    updateConversationTitle: (conversationId: string, newTitle: string) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    React.useEffect(() => {
        const handleAddConversation = (event: CustomEvent<Conversation>) => {
            setConversations(prev => [event.detail, ...prev]);
        };

        window.addEventListener('addConversation', handleAddConversation as EventListener);

        return () => {
            window.removeEventListener('addConversation', handleAddConversation as EventListener);
        };
    }, []);

    const removeConversation = (conversationId: string) => {
        setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
    };

    const updateConversationTitle = (conversationId: string, newTitle: string) => {
        setConversations(prev => prev.map(conv => 
            conv.conversation_id === conversationId 
                ? {...conv, chat_title: newTitle}
                : conv
        ));
    };

    return (
        <ConversationsContext.Provider value={{ 
            conversations, 
            setConversations,
            removeConversation,
            updateConversationTitle
        }}>
            {children}
        </ConversationsContext.Provider>
    );
};

export const useConversations = () => {
    const context = useContext(ConversationsContext);
    if (context === undefined) {
        throw new Error('useConversations must be used within a ConversationsProvider');
    }
    return context;
};
