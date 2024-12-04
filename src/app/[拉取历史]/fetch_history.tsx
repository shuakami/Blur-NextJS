// src/app/[拉取历史]/fetch_history.tsx

import apiClient from '@/lib/api/config';
import {FetchHistoryParams, FetchHistoryResponse} from '@/types/stream';
import {getTranslate} from '@/hooks/i18n/useTranslation';

/**
 * 拉取历史记录的函数
 * @param params - 请求参数，包括 user_id、conversation_id、limit 和 offset
 * @returns 返回拉取的历史记录
 * @throws 如果请求失败，则抛出错误
 */
export const fetchHistory = async (params: FetchHistoryParams): Promise<FetchHistoryResponse> => {
    const t = getTranslate();
    const requestBody: Record<string, any> = {
        user_id: params.user_id,
        limit: params.limit || 20,
        offset: params.offset || 0,
    };

    // 如果传入了 conversation_id，则添加到请求体中
    if (params.conversation_id) {
        requestBody.conversation_id = params.conversation_id;
    }

    try {
        // 发送 POST 请求
        const response = await apiClient.post<FetchHistoryResponse>('/api/v1/history', requestBody);
        return response.data;
    } catch (error) {
        throw new Error(t('拉取历史记录失败'));
    }
};
