// src/app/[对话管理]/api.ts

import apiClient from '@/api/config';
import {getTranslate} from '@/hooks/useTranslation';

/**
 * 更新对话标题的函数
 * @param conversationId - 要更新的对话 ID
 * @param newTitle - 新的对话标题
 * @param userId - 用户 ID
 * @returns 返回更新成功的消息
 * @throws 如果请求失败，则抛出错误
 */
export const updateConversationTitle = async (
    conversationId: string,
    newTitle: string,
    userId: string
): Promise<void> => {
    const t = getTranslate();
    try {
        const response = await apiClient.put(`/api/v1/conversations/${conversationId}/title`, null, {
            params: {
                new_title: newTitle,
                user_id: userId,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(t('更新对话标题失败'));
    }
};

/**
 * 删除对话的函数
 * @param conversationId - 要删除的对话 ID
 * @param userId - 用户 ID
 * @returns 返回删除成功的消息
 * @throws 如果请求失败，则抛出错误
 */
export const deleteConversation = async (
    conversationId: string,
    userId: string
): Promise<void> => {
    const t = getTranslate();
    try {
        const response = await apiClient.delete(`/api/v1/conversations/${conversationId}`, {
            params: {
                user_id: userId,
            },
        });

        // 打印调试信息，查看返回的内容
        console.log('API Response:', response);

        // 检查 response 和 response.data 是否存在
        if (!response || !response.data) {
            throw new Error(t('无效的响应'));
        }

        return response.data; // 确保返回正确的数据
    } catch (error) {
        console.error('API Error:', error); // 打印错误信息
        throw new Error(t('删除对话失败'));
    }
};
