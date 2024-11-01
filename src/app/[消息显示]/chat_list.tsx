// src/app/[消息显示]/chat_list.tsx

"use client";

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import {useChatContext} from '@/app/[上下文]/ChatContext';

// 懒加载 UIChatList
const UIChatList = dynamic(
    () => import('@/components/ui/chat-list').then(mod => mod.ChatList),
    {
        loading: () => <div className="animate-pulse h-full w-full bg-gray-100 dark:bg-gray-800/30" />,
        ssr: false
    }
);

const ChatList = memo(() => {
    const {messages, isLoading} = useChatContext();
    
    return <UIChatList messages={messages} isLoading={isLoading} />;
});

ChatList.displayName = 'ChatList';

export default ChatList;
