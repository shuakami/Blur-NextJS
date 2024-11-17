// 创建一个新的类型文件来共享类型定义
export interface Conversation {
    conversation_id: string;
    chat_title: string | null;
    timestamp: number;  // 统一使用数字类型的时间戳
}

export interface ConversationsResponse {
    conversations: Array<{
        conversation_id: string;
        chat_title: string;
        timestamp: string;  // API 返回的 ISO 时间字符串
    }>;
    total_conversations: number;
}

export interface FetchParams {
    limit?: number;
    offset?: number;
}