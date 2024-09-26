// src/app/[消息显示]/chat_list.tsx

"use client";

import React from 'react';
import {useChatContext} from '@/app/[上下文]/ChatContext'; // 从上下文获取消息
import {ChatList as UIChatList} from '@/components/ui/chat-list';

const ChatList: React.FC = () => {
    const {messages} = useChatContext(); // 从上下文中获取 messages

    return (
        <>
            <UIChatList messages={messages}/>
        </>
    );
};

export default ChatList;
