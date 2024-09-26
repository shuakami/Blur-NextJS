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
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    return (
        <ConversationsContext.Provider value={{conversations, setConversations}}>
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
