"use client";

import React, {useCallback, useEffect, useState, useMemo, memo} from 'react';
import {fetchConversations} from '@/app/[侧边栏管理]/fetch_conversations';
import ChatSidebar from '@/components/chat/chat_sidebar';
import {useUser} from '@clerk/nextjs';
import UnauthenticatedSidebar from "@/components/NoLogin/nologin_chat_sidebar";
import {useConversations} from "../../../contexts/ConversationsContext";
import useTranslation from "@/hooks/useTranslation";
import type {Conversation} from './types';

// 日期分组函数
const groupConversationsByDate = (conversations: Conversation[], t: (key: string) => string) => {
    if (!conversations.length) return [];
    const grouped = new Map<string, Conversation[]>();
    const now = Date.now();
    const DAY_IN_MS = 86400000;
    
    // 预先排序
    conversations.sort((a, b) => b.timestamp - a.timestamp);
    
    for (const convo of conversations) {
        const date = new Date(convo.timestamp * 1000);
        const dateKey = date.toDateString();
        
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(convo);
    }
    
    return Array.from(grouped.entries()).map(([_, convos]) => ({
        date: convos[0].timestamp * 1000,
        children: convos.map(convo => ({
            id: convo.conversation_id,
            label: convo.chat_title || t('未命名对话'),
            href: `/chat/${convo.conversation_id}`,
        }))
    }));
};

interface MessagesSidebarProps {
    onClose?: () => void;
    onUpdateConversations?: (loadConversations: () => void) => void;
}


const MessagesSidebar = memo<MessagesSidebarProps>(({onClose, onUpdateConversations}) => {
    const {t} = useTranslation();
    const {isSignedIn, user, isLoaded} = useUser();
    const {conversations, setConversations} = useConversations();
    
    const [state, setState] = useState<{
        loading: boolean;
        hasMore: boolean;
        offset: number;
    }>({
        loading: true,
        hasMore: true,
        offset: 0
    });
    
    const LIMIT = 20;
    const loadConversations = useCallback(async (isInitial = false) => {
        if (!user?.id || (!isInitial && !state.hasMore)) return;
        
        if (isInitial) {
            setState(prev => ({...prev, loading: true}));
        }
        
        try {
            const currentOffset = isInitial ? 0 : state.offset;
            const result = await fetchConversations(user.id, {
                limit: LIMIT,
                offset: currentOffset
            });
            
            setConversations(prev => {
                if (isInitial) return result.conversations;
                const newConvos = result.conversations.filter(c => 
                    !prev.some(p => p.conversation_id === c.conversation_id)
                );
                return [...prev, ...newConvos];
            });
            
            setState(prev => ({
                loading: false,
                hasMore: result.hasMore,
                offset: currentOffset + result.conversations.length
            }));
        } catch (err) {
            console.error('Load conversations error:', err);
            setState(prev => ({...prev, loading: false}));
        }
    }, [user?.id, state.hasMore, state.offset, setConversations]);

    useEffect(() => {
        if (isSignedIn && user?.id && state.loading) {
            loadConversations(true);
        }
    }, [isSignedIn, user?.id, state.loading, loadConversations]);

    const sidebarItems = useMemo(() => 
        groupConversationsByDate(conversations, t),
        [conversations, t]
    );

    const userInfo = useMemo(() => ({
        avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png',
        name: user?.fullName || t('未命名用户'),
        status: 'Test#AL1_0001',
    }), [user?.imageUrl, user?.fullName, t]);

    // 未登录直接返回
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
            hasMore={state.hasMore}
            loading={state.loading}
        />
    );
});

MessagesSidebar.displayName = 'MessagesSidebar';

export default MessagesSidebar;
