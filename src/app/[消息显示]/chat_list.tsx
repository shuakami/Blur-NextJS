// src/app/[消息显示]/chat_list.tsx

"use client";

import React, { memo } from 'react';
import {useMessageContext, useChatStateContext} from '@/app/[上下文]/ChatContext';
import {ChatList as UIChatList} from '@/components/ui/chat-list';

const ChatList = memo(() => {
    const {messages} = useMessageContext();
    const { isLoading } = useChatStateContext();
    
    console.log(messages);
    return <UIChatList messages={messages} isLoading={isLoading || false} />;
});

ChatList.displayName = 'ChatList';

export default ChatList;
