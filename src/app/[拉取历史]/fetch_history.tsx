// src/app/拉取历史/fetch_history.ts

import apiClient from '@/api/config';
import {FetchHistoryParams, FetchHistoryResponse} from '@/types/stream';

/**
 * 拉取历史记录的函数
 * @param params - 请求参数，包括 user_id 和 conversation_id
 * @returns 返回拉取的历史记录
 * @throws 如果请求失败，则抛出错误
 */
export const fetchHistory = async (params: FetchHistoryParams): Promise<FetchHistoryResponse> => {
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
        const response = await apiClient.post<FetchHistoryResponse>('/history', requestBody);
        return response.data;
    } catch (error) {
        // 可以在此处集成日志记录服务，例如 Sentry
        throw new Error('拉取历史记录失败');
    }
};
