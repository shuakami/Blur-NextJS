"use client";

import React, { useCallback, useEffect, useState, useMemo, memo, useRef } from 'react';
import { fetchConversations } from '@/app/[侧边栏管理]/fetch_conversations';
import ChatSidebar from '@/components/chat/chat_sidebar';
import { useUser } from '@clerk/nextjs';
import UnauthenticatedSidebar from "@/components/NoLogin/nologin_chat_sidebar";
import { useConversations } from "../[对话管理]/ConversationsContext";
import useTranslation from '../../hooks/i18n/useTranslation';
import type { Conversation } from './types';

// 常量定义
const LIMIT = 20;

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
    onUpdateConversations?: (loadConversations: () => void) => void;
}

interface SidebarState {
    loading: boolean;
    hasMore: boolean;
    offset: number;
    error: Error | null;
}

const MessagesSidebar = memo<MessagesSidebarProps>(({onClose, onUpdateConversations}) => {
    const { t } = useTranslation();
    const { isSignedIn, user, isLoaded } = useUser();
    const { conversations, setConversations } = useConversations();
    
    // 跟踪加载状态
    const loadingRef = useRef(false);
    
    const [state, setState] = useState<SidebarState>({
        loading: true,
        hasMore: true,
        offset: 0,
        error: null
    });
    
    // 会话加载
    const loadConversations = useCallback(async (isInitial = false) => {
        if (!user?.id || (!isInitial && !state.hasMore) || loadingRef.current) return;
        
        loadingRef.current = true;
        
        if (isInitial) {
            setState(prev => ({ ...prev, loading: true, error: null }));
        }
        
        try {
            const currentOffset = isInitial ? 0 : state.offset;
            const result = await fetchConversations(user.id, {
                limit: LIMIT,
                offset: currentOffset
            });
            
            setConversations(prev => {
                if (isInitial) return result.conversations;
                
                // 使用 Set 优化查重
                const existingIds = new Set(prev.map(p => p.conversation_id));
                const newConvos = result.conversations.filter(c => 
                    !existingIds.has(c.conversation_id)
                );
                
                return [...prev, ...newConvos];
            });
            
            setState(prev => ({
                loading: false,
                hasMore: result.hasMore,
                offset: currentOffset + result.conversations.length,
                error: null
            }));
        } catch (err) {
            console.error('Load conversations error:', err);
            setState(prev => ({
                ...prev,
                loading: false,
                error: err as Error
            }));
        } finally {
            loadingRef.current = false;
        }
    }, [user?.id, state.hasMore, state.offset, setConversations]);

    // 初始加载
    useEffect(() => {
        let mounted = true;
        
        if (isSignedIn && user?.id && state.loading && mounted) {
            loadConversations(true);
        }
        
        return () => {
            mounted = false;
        };
    }, [isSignedIn, user?.id, state.loading, loadConversations]);

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
    
    // 错误处理
    if (state.error) {
        console.error('Sidebar error:', state.error);
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