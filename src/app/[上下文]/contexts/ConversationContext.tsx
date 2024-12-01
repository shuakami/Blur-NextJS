import React, { createContext, useContext } from 'react';
import { ConversationState } from '../types/chat';

const ConversationContext = createContext<ConversationState | undefined>(undefined);

export const ConversationProvider: React.FC<{
    children: React.ReactNode;
    value: ConversationState;
}> = ({ children, value }) => {
    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversationContext = () => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('useConversationContext must be used within a ConversationProvider');
    }
    return context;
}; 