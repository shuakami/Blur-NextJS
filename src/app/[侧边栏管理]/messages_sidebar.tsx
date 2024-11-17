"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {fetchConversations} from '@/app/[侧边栏管理]/fetch_conversations';
import ChatSidebar from '@/components/chat/chat_sidebar';
import {useUser} from '@clerk/nextjs';
import UnauthenticatedSidebar from "@/components/NoLogin/nologin_chat_sidebar";
import {useConversations} from "../../../contexts/ConversationsContext";
import useTranslation from "@/hooks/useTranslation";
import {Conversation} from './types';

// 对话按日期分组
const groupConversationsByDate = (conversations: Conversation[], t: (key: string) => string) => {
    // 按照时间戳降序排列对话
    conversations.sort((a, b) => b.timestamp - a.timestamp);

    const grouped: Record<string, Conversation[]> = {};

    conversations.forEach((convo) => {
        const dateKey = new Date(convo.timestamp * 1000).toDateString(); // 秒级时间戳转换为毫秒
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(convo);
    });

    return Object.keys(grouped).map(dateKey => ({
        date: grouped[dateKey][0].timestamp * 1000,  // 保留第一个对话的时间戳 (转换为毫秒)
        children: grouped[dateKey].map(convo => ({
            id: convo.conversation_id,
            label: convo.chat_title || t('未命名对话'),
            href: `/chat/${convo.conversation_id}`, // 链接跳转
        })),
    }));
};

interface MessagesSidebarProps {
    onClose?: () => void;
    onUpdateConversations?: (loadConversations: () => void) => void;
}

const MessagesSidebar: React.FC<MessagesSidebarProps> = ({onClose, onUpdateConversations}) => {
    const {t} = useTranslation();
    const {isSignedIn, user, isLoaded} = useUser();
    const {conversations, setConversations} = useConversations();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const LIMIT = 20;

    // 修改加载函数支持分页
    const loadConversations = useCallback(async (isInitial: boolean = false) => {
        if (!user?.id || loading || (!isInitial && !hasMore)) return;

        setLoading(true);
        try {
            const currentOffset = isInitial ? 0 : offset;
            const { conversations: newConversations, hasMore: moreAvailable } = 
                await fetchConversations(user.id, {
                    limit: LIMIT,
                    offset: currentOffset
                });
            
            if (isInitial) {
                setConversations(newConversations);
            } else {
                setConversations(prev => {
                    // 防止重复数据
                    const existingIds = new Set(prev.map(c => c.conversation_id));
                    const uniqueNewConversations = newConversations.filter(
                        c => !existingIds.has(c.conversation_id)
                    );
                    return [...prev, ...uniqueNewConversations];
                });
            }
            
            setHasMore(moreAvailable);
            setOffset(currentOffset + newConversations.length);
        } catch (err) {
            setError(t('无法加载对话列表'));
            console.error('Load conversations error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, offset, loading, hasMore, setConversations, t]);

    // 初始加载
    useEffect(() => {
        if (isSignedIn && user?.id) {
            loadConversations(true);
        }
    }, [isSignedIn, user?.id]);

    if (!isSignedIn) {
        setTimeout(() => {
            return <UnauthenticatedSidebar onClose={onClose || (() => {
            })}/>; // 用户未登录时显示提示
        }, 500);
    }

    const sidebarItems = groupConversationsByDate(conversations, t);

    const userInfo = {
        avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png', // 使用 Clerk 提供的头像
        name: user?.fullName || t('未命名用户'),
        status: 'Test#AL1_0001',
    };

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
};

export default MessagesSidebar;
