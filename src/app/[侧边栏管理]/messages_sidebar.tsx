"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {fetchConversations} from '@/app/[侧边栏管理]/fetch_conversations';
import ChatSidebar from '@/components/chat/chat_sidebar';
import {useUser} from '@clerk/nextjs'; // 从 Clerk 获取用户信息

interface Conversation {
    conversation_id: string;
    chat_title: string | null;
    timestamp: number;  // 秒级时间戳
}

// 对话按日期分组
const groupConversationsByDate = (conversations: Conversation[]) => {
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
            label: convo.chat_title || '未命名对话',
            href: `/chat/${convo.conversation_id}`, // 链接跳转
        })),
    }));
};

interface MessagesSidebarProps {
    onClose?: () => void
}

const MessagesSidebar: React.FC<MessagesSidebarProps> = ({onClose}) => {
    const {isSignedIn, user, isLoaded} = useUser(); // 获取用户登录状态和用户信息
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 使用 useCallback 确保 loadConversations 稳定
    const loadConversations = useCallback(async () => {
        if (!user?.id) {
            setError('用户信息未加载');
            return;
        }

        setLoading(true);
        try {
            const data = await fetchConversations(user.id); // 使用真实的用户 ID
            setConversations(data);
        } catch (err) {
            setError('无法加载对话列表');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isSignedIn && user?.id) {
            loadConversations(); // 当用户ID存在且已登录时加载对话列表
        }
    }, [isSignedIn, user?.id, loadConversations]);

    if (!isLoaded) {
        return <div>加载中...</div>; // 等待 Clerk 加载完成
    }

    if (!isSignedIn) {
        return <div>请先登录以查看对话。</div>; // 用户未登录时显示提示
    }

    if (loading) return <div>加载中...</div>;
    if (error) return <div>{error}</div>;

    const sidebarItems = groupConversationsByDate(conversations);

    const userInfo = {
        avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png', // 使用 Clerk 提供的头像
        name: user?.fullName || 'User',
        status: 'Test#AL1_0001', // 可以根据需要调整用户状态
    };

    return <ChatSidebar items={sidebarItems} user={userInfo} onClose={onClose || (() => {
    })}/>;
};

export default MessagesSidebar;
