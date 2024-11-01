"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {fetchConversations} from '@/app/[侧边栏管理]/fetch_conversations';
import ChatSidebar from '@/components/chat/chat_sidebar';
import {useUser} from '@clerk/nextjs';
import ChatSidebarLoading from "@/components/Loading/loading_chat_sidebar";
import UnauthenticatedSidebar from "@/components/NoLogin/nologin_chat_sidebar";
import {useConversations} from "../../../contexts/ConversationsContext";
import useTranslation from "@/hooks/useTranslation";

interface Conversation {
    conversation_id: string;
    chat_title: string | null;
    timestamp: number;  // 秒级时间戳
}

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
    onUpdateConversations?: (loadConversations: () => void) => void; // 新增: 用于暴露加载函数
}

const MessagesSidebar: React.FC<MessagesSidebarProps> = ({onClose, onUpdateConversations}) => {
    const {t} = useTranslation();
    const {isSignedIn, user, isLoaded} = useUser(); // 获取用户登录状态和用户信息
    const {conversations, setConversations} = useConversations(); // 使用 ConversationsContext
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 使用 useCallback 确保 loadConversations 稳定
    const loadConversations = useCallback(async () => {
        if (!user?.id) {
            setError(t('用户信息未加载'));
            return;
        }

        setLoading(true);
        try {
            const data = await fetchConversations(user.id); // 使用真实的用户 ID
            setConversations(data); // 将对话列表存储到 Context 中
        } catch (err) {
            setError(t('无法加载对话列表'));
        } finally {
            setLoading(false);
        }
    }, [user?.id, setConversations, t]);

    // 向父组件暴露加载函数
    useEffect(() => {
        if (onUpdateConversations) {
            onUpdateConversations(loadConversations);
        }
    }, [onUpdateConversations, loadConversations]);

    useEffect(() => {
        if (isSignedIn && user?.id) {
            loadConversations(); // 当用户ID存在且已登录时加载对话列表
        }
    }, [isSignedIn, user?.id, loadConversations]);


    if (!isSignedIn) {
        return <UnauthenticatedSidebar onClose={onClose || (() => {
        })}/>; // 用户未登录时显示提示
    }

    if (loading) return null;

    const sidebarItems = groupConversationsByDate(conversations, t);

    const userInfo = {
        avatarUrl: user?.imageUrl || 'https://github.com/shuakami.png', // 使用 Clerk 提供的头像
        name: user?.fullName || t('未命名用户'),
        status: 'Test#AL1_0001',
    };

    return (
        <ChatSidebar items={sidebarItems} user={userInfo} onClose={onClose || (() => {
        })} onUpdateConversations={loadConversations}/>
    );
};

export default MessagesSidebar;
