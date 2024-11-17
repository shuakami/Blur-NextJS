// src/app/[侧边栏管理]/fetch_conversations.tsx
import apiClient from '@/api/config';
import {getTranslate} from "@/hooks/useTranslation";
import {Conversation, ConversationsResponse, FetchParams} from './types';

export const fetchConversations = async (
    user_id: string, 
    params: FetchParams = { limit: 20, offset: 0 }
): Promise<{ conversations: Conversation[], hasMore: boolean }> => {
    const t = getTranslate();
    try {
        const response = await apiClient.get<ConversationsResponse>('/api/v1/conversations', {
            params: {
                user_id,
                limit: params.limit,
                offset: params.offset,
            },
        });
        
        // 计算是否还有更多数据
        const hasMore = (params.offset || 0) + (params.limit || 20) < response.data.total_conversations;
        
        // 转换时间戳格式
        const conversations: Conversation[] = response.data.conversations.map(conv => ({
            conversation_id: conv.conversation_id,
            chat_title: conv.chat_title || null,
            timestamp: Math.floor(new Date(conv.timestamp).getTime() / 1000) // 转换为秒级时间戳
        }));

        return {
            conversations,
            hasMore
        };
    } catch (error) {
        console.error(t('拉取对话列表失败:'), error);
        throw error;
    }
};
