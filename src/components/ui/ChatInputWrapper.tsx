"use client";

import React from 'react';
import ChatInput from './chat_input';
import {useChatContext} from '@/app/[上下文]/ChatContext';

interface ChatInputWrapperProps {
    onFirstMessage?: () => void; // 发送首条消息时的回调
}

const ChatInputWrapper: React.FC<ChatInputWrapperProps> = ({onFirstMessage}) => {
    const {sendMessage} = useChatContext();

    const handleSend = (message: string) => {
        console.log('发送的消息:', message);
        sendMessage(message);
        if (onFirstMessage) {
            onFirstMessage(); // 通知父组件发送了首条消息
        }
    };

    return <ChatInput onSend={handleSend} />;
};

export default ChatInputWrapper;
