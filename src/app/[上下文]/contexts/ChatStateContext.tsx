import React, { createContext, useContext } from 'react';
import { ChatState } from '../types/chat';

const ChatStateContext = createContext<ChatState | undefined>(undefined);

export const ChatStateProvider: React.FC<{
    children: React.ReactNode;
    value: ChatState;
}> = ({ children, value }) => {
    return (
        <ChatStateContext.Provider value={value}>
            {children}
        </ChatStateContext.Provider>
    );
};

export const useChatStateContext = () => {
    const context = useContext(ChatStateContext);
    if (!context) {
        throw new Error('useChatStateContext must be used within a ChatStateProvider');
    }
    return context;
}; 