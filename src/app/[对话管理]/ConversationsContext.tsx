"use client";

import React, { createContext, useState, ReactNode, useContext, useCallback, useMemo } from 'react';

interface Conversation {
    conversation_id: string;
    chat_title: string | null;
    timestamp: number;
}

interface ConversationsContextType {
    conversations: Conversation[];
    recentConversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    removeConversation: (conversationId: string) => void;
    updateConversationTitle: (conversationId: string, newTitle: string) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const ConversationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const processedIds = React.useRef(new Set<string>());
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const recentConversations = useMemo(() => {
        return [...conversations]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
    }, [conversations]);

    const removeConversation = useCallback((conversationId: string) => {
        setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
        processedIds.current.delete(conversationId);
    }, []);

    const updateConversationTitle = useCallback((conversationId: string, newTitle: string) => {
        setConversations(prev => prev.map(conv =>
            conv.conversation_id === conversationId
                ? { ...conv, chat_title: newTitle }
                : conv
        ));
    }, []);

    const handleAddConversation = useCallback((event: CustomEvent<Conversation>) => {
        const newConversation = event.detail;
        
        setConversations(prev => {
            if (processedIds.current.has(newConversation.conversation_id)) {
                return prev;
            }
            processedIds.current.add(newConversation.conversation_id);
            return [newConversation, ...prev];
        });
    }, []);

    const handleUpdateTitle = useCallback((event: CustomEvent<{conversation_id: string, chat_title: string}>) => {
        const { conversation_id, chat_title } = event.detail;
        updateConversationTitle(conversation_id, chat_title);
    }, [updateConversationTitle]);

    React.useEffect(() => {
        window.addEventListener('addConversation', handleAddConversation as EventListener);
        window.addEventListener('updateConversationTitle', handleUpdateTitle as EventListener);
        
        return () => {
            window.removeEventListener('addConversation', handleAddConversation as EventListener);
            window.removeEventListener('updateConversationTitle', handleUpdateTitle as EventListener);
        };
    }, [handleAddConversation, handleUpdateTitle]);

    const value = useMemo(() => ({
        conversations,
        recentConversations,
        setConversations,
        removeConversation,
        updateConversationTitle
    }), [conversations, recentConversations, removeConversation, updateConversationTitle]);

    return (
        <ConversationsContext.Provider value={value}>
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