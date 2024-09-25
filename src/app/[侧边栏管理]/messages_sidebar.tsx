"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {fetchConversations} from '@/app/[侧边栏管理]/fetch_conversations';
import ChatSidebar from '@/components/chat/chat_sidebar';

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


const MessagesSidebar: React.FC<{ user_id: string }> = ({user_id}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 使用 useCallback 确保 loadConversations 稳定
    const loadConversations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchConversations(user_id);
            setConversations(data);
        } catch (err) {
            setError('无法加载对话列表');
        } finally {
            setLoading(false);
        }
    }, [user_id]);

    useEffect(() => {
        loadConversations();
    }, [user_id, loadConversations]);

    if (loading) return <div>加载中...</div>;
    if (error) return <div>{error}</div>;

    const sidebarItems = groupConversationsByDate(conversations);

    const user = {
        avatarUrl: 'https://github.com/shuakami.png',
        name: 'Admin',
        status: 'Test#AL1_0001',
    };

    return <ChatSidebar items={sidebarItems} user={user}/>;
};

export default MessagesSidebar;
