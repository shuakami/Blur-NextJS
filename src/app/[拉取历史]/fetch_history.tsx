// src/app/[拉取历史]/fetch_history.tsx
import apiClient from '@/api/config';

// 定义请求参数的类型
interface FetchHistoryParams {
    user_id: string;
    conversation_id?: string;
    limit?: number;
    offset?: number;
}

// 定义消息的类型
interface Message {
    message_id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
    branch: string | null;
    keys_used_count: number;
}

// 定义拉取历史记录的响应类型
interface FetchHistoryResponse {
    user_id: string;
    conversation_id: string;
    messages: Message[];
}

// 拉取历史记录的函数
export const fetchHistory = async (params: FetchHistoryParams): Promise<FetchHistoryResponse> => {
    try {
        const requestBody: any = {
            user_id: params.user_id,
            limit: params.limit || 20,
            offset: params.offset || 0,
        };

        // 如果传入了 conversation_id，则添加到请求体中
        if (params.conversation_id) {
            requestBody.conversation_id = params.conversation_id;
        }

        // 发送 POST 请求
        const response = await apiClient.post<FetchHistoryResponse>('/history', requestBody);

        return response.data;
    } catch (error) {
        console.error('拉取历史记录失败:', error);
        throw error;
    }
};
