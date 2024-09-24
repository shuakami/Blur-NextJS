// src/app/ui/ChatInputWrapper.tsx
"use client";

import React from 'react';
import ChatInput from './chat_input';
import {useChatContext} from '@/app/[上下文]/ChatContext';

const ChatInputWrapper: React.FC = () => {
    const {sendMessage} = useChatContext();

    const handleSend = (message: string) => {
        console.log('发送的消息:', message);
        sendMessage(message);
    };

    return <ChatInput onSend={handleSend} />;
};

export default ChatInputWrapper;
