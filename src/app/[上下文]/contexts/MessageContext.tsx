import React, { createContext, useContext } from 'react';
import { MessageState } from '../types/chat';

const MessageContext = createContext<MessageState | undefined>(undefined);

export const MessageProvider: React.FC<{
    children: React.ReactNode;
    value: MessageState;
}> = ({ children, value }) => {
    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessageContext = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessageContext must be used within a MessageProvider');
    }
    return context;
}; 