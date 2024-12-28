"use client";

import React, { useEffect, useMemo, memo } from 'react';
import ChatSidebar from '@/components/chat/chat_sidebar';
import { useUser } from '@clerk/nextjs';
import UnauthenticatedSidebar from "@/components/NoLogin/nologin_chat_sidebar";
import useTranslation from '../../hooks/i18n/useTranslation';
import type { Conversation } from './types';
import { useSidebar } from './SidebarContext';
import { useConversations } from '../[对话管理]/ConversationsContext';

// 日期缓存
const dateCache = new Map<number, string>();
const getDateKey = (timestamp: number): string => {
    const cached = dateCache.get(timestamp);
    if (cached) return cached;
    
    const key = new Date(timestamp * 1000).toDateString();
    dateCache.set(timestamp, key);
    return key;
};

// 日期分组函数
const groupConversationsByDate = (conversations: Conversation[], t: (key: string) => string) => {
    if (!conversations.length) return [];
    
    // Map分组
    const grouped = new Map<string, {
        timestamp: number;
        conversations: Conversation[];
    }>();
    
    // 预先排序，只排序一次
    const sorted = [...conversations].sort((a, b) => b.timestamp - a.timestamp);
    
    for (const convo of sorted) {
        const dateKey = getDateKey(convo.timestamp);
        
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, {
                timestamp: convo.timestamp,
                conversations: []
            });
        }
        grouped.get(dateKey)!.conversations.push(convo);
    }
    
    return Array.from(grouped.values()).map(({ timestamp, conversations: convos }) => ({
        date: timestamp * 1000,
        children: convos.map(convo => ({
            id: convo.conversation_id,
            label: convo.chat_title || t('未命名对话'),
            href: `/chat/${convo.conversation_id}`,
        }))
    }));
};

interface MessagesSidebarProps {
    onClose?: () => void;
}

const MessagesSidebar = memo<MessagesSidebarProps>(({onClose}) => {
    const { t } = useTranslation();
    const { isSignedIn, user, isLoaded } = useUser();
    const { 
        conversations, 
        loading, 
        hasMore, 
        loadConversations 
    } = useSidebar();
    const { conversations: contextConversations } = useConversations();

    // 初始加载
    useEffect(() => {
        if (isSignedIn && user?.id) {
            loadConversations(true);
        }
    }, [isSignedIn, user?.id, loadConversations]);

    // 优化侧边栏项目计算
    const sidebarItems = useMemo(() => 
        groupConversationsByDate(conversations, t),
        [conversations, t]
    );

    // 优化用户信息计算
    const userInfo = useMemo(() => ({
        avatarUrl: user?.imageUrl || '',
        name: user?.fullName || t('未命名用户'),
        status: 'Test#AL1_0001',
    }), [user?.imageUrl, user?.fullName, t]);

    // 处理未登录状态
    if (isLoaded && !isSignedIn) {
        return <UnauthenticatedSidebar onClose={onClose || (() => {})} />;
    }
    
    return (
        <ChatSidebar 
            items={sidebarItems} 
            user={userInfo} 
            onClose={onClose || (() => {})} 
            onUpdateConversations={() => loadConversations(true)}
            onLoadMore={() => loadConversations(false)}
            hasMore={hasMore}
            loading={loading}
        />
    );
});

MessagesSidebar.displayName = 'MessagesSidebar';

export default MessagesSidebar;