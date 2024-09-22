"use client";

import React from 'react';
import ChatInput from './chat_input';


const ChatInputWrapper: React.FC = () => {
    const handleSend = (message: string) => {
        console.log('发送的消息:', message)
    }

    return <ChatInput onSend={handleSend} />;
};

export default ChatInputWrapper;