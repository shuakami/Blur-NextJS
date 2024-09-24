// src/app/[侧边栏管理]/messages_sidebar.tsx
import React, {useEffect, useState} from 'react';
import {fetchConversations} from '@/app/[侧边栏管理]/fetch_conversations';

interface Conversation {
    conversation_id: string;
    chat_title: string;
    timestamp: number;
}

interface MessagesSidebarProps {
    user_id: string;
    onSelectConversation: (conversation_id: string) => void;
}

const MessagesSidebar: React.FC<MessagesSidebarProps> = ({user_id, onSelectConversation}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const data = await fetchConversations(user_id);
            setConversations(data);
        } catch (err) {
            setError('无法加载对话列表');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();

        // 首次发起新对话5秒后更新一次
        const interval = setInterval(() => {
            loadConversations();
        }, 5000);

        return () => clearInterval(interval);
    }, [user_id]);

    if (loading) return <div>加载中...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">对话列表</h2>
            <ul className="space-y-2">
                {conversations.map(convo => (
                    <li
                        key={convo.conversation_id}
                        className="cursor-pointer p-2 rounded hover:bg-gray-200"
                        onClick={() => onSelectConversation(convo.conversation_id)}
                    >
                        <span className="font-semibold">{convo.chat_title || '未命名对话'}</span>
                        <br/>
                        <span
                            className="text-sm text-gray-500">{new Date(convo.timestamp * 1000).toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MessagesSidebar;
