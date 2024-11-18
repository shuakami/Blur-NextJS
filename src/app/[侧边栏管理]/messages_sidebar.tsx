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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const LIMIT = 20;
    
    // 加载函数
    const loadConversations = useCallback(async (isInitial = false) => {
        if (!user?.id || loading || (!isInitial && !hasMore)) return;
        
        setLoading(true);
        
        try {
            const currentOffset = isInitial ? 0 : offset;
            const result = await fetchConversations(user.id, {
                limit: LIMIT,
                offset: currentOffset
            });
            
            setConversations(prev => {
                if (isInitial) return result.conversations;
                
                // 去重
                const existingIds = new Set(prev.map(c => c.conversation_id));
                return [
                    ...prev,
                    ...result.conversations.filter(c => !existingIds.has(c.conversation_id))
                ];
            });
            
            setHasMore(result.hasMore);
            setOffset(currentOffset + result.conversations.length);
        } catch (err) {
            setError(t('无法加载对话列表'));
            console.error('Load conversations error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, offset, loading, hasMore, setConversations, t]);

    // 初始加载
    useEffect(() => {
        let mounted = true;
        
        if (isSignedIn && user?.id) {
            loadConversations(true).then(() => {
                if (mounted && onUpdateConversations) {
                    onUpdateConversations(() => loadConversations(true));
                }
            });
        }
        
        return () => {
            mounted = false;
        };
    }, [isSignedIn, user?.id]);

    // 数据处理
    const sidebarItems = useMemo(() => 
        groupConversationsByDate(conversations, t),
        [conversations, t]
    );

    const userInfo = useMemo(() => ({
        avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png',
        name: user?.fullName || t('未命名用户'),
        status: 'Test#AL1_0001',
    }), [user?.imageUrl, user?.fullName, t]);

    // 未登录判断移到这里
    if (!isSignedIn) {
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
