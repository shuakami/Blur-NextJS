// src/app/[对话管理]/stop_stream.ts

import apiClient from '../api/config/route';
import {getTranslate} from '../../hooks/i18n/useTranslation';

/**
 * 发送停止消息流的请求
 * @param conversationId - 对话 ID
 * @param messageId - 消息 ID
 * @param userId - 用户 ID
 * @returns 返回停止成功的消息
 * @throws 如果请求失败，则抛出错误
 */
export const stopStream = async (
    conversationId: string,
    messageId: string,
    userId: string
): Promise<void> => {
    const t = getTranslate();

    try {
        const response = await apiClient.post('/api/v1/message/stop', null, {
            params: {
                conversation_id: conversationId,
                user_id: userId,
            },
        });

        if (response.status !== 200) {
            throw new Error(t('停止流式输出失败'));
        }

        return response.data;
    } catch (error) {
        throw new Error(t('停止流式输出失败'));
    }
};
