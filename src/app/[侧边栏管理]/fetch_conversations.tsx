// src/app/[侧边栏管理]/fetch_conversations.tsx
import apiClient from '@/api/config';
import {getTranslate} from "@/hooks/useTranslation";

interface Conversation {
    conversation_id: string;
    chat_title: string;
    timestamp: number;
}

export const fetchConversations = async (user_id: string): Promise<Conversation[]> => {
    const t = getTranslate();
    try {
        const response = await apiClient.get<Conversation[]>('/api/v1/conversations', {
            params: {user_id},
        });
        return response.data;
    } catch (error) {
        console.error(t('拉取对话列表失败:'), error);
        throw error;
    }
};
