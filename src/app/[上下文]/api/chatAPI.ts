import { sendMessage as sendMessageAPIBase } from '@/app/[消息发送]/send_message';
import { stopStream as stopStreamAPIBase } from '@/app/[对话管理]/stop_stream';
import { fetchHistory as fetchHistoryBase } from "@/app/[拉取历史]/fetch_history";
import { SendMessageResponse, StreamChunk, FinalInfo, APIMessage, Message } from '@/types/stream';

// 发送消息的参数接口
interface SendMessageParams {
    userInput: string;
    userId: string;
    token: string;
    conversationId?: string | null;
    onInitialResponse: (response: SendMessageResponse) => void;
    onChunk: (chunk: StreamChunk) => void;
    onFinalInfo: (info: FinalInfo) => void;
    onError: (error: any) => void;
    signal: AbortSignal;
}

// 发送消息 API
export const sendMessageAPI = async ({
    userInput,
    userId,
    token,
    conversationId,
    onInitialResponse,
    onChunk,
    onFinalInfo,
    onError,
    signal
}: SendMessageParams) => {
    try {
        await sendMessageAPIBase(
            {
                user_input: userInput,
                user_id: userId,
                conversation_id: conversationId || undefined,
            },
            token,
            onInitialResponse,
            onChunk,
            onFinalInfo,
            onError,
            signal
        );
    } catch (error) {
        throw error;
    }
};

// 停止流式传输 API
export const stopStreamAPI = async (
    conversationId: string, 
    messageId: string, 
    userId: string
): Promise<void> => {
    try {
        await stopStreamAPIBase(conversationId, messageId, userId);
    } catch (error) {
        throw error;
    }
};

// 获取历史记录的参数接口
interface FetchHistoryParams {
    userId: string;
    conversationId: string;
    limit: number;
    offset: number;
}

// 获取历史记录的返回接口
interface FetchHistoryResponse {
    messages: APIMessage[];
    total_count: number;
}

// 获取历史记录 API
export const fetchHistoryAPI = async ({
    userId,
    conversationId,
    limit,
    offset
}: FetchHistoryParams): Promise<FetchHistoryResponse> => {
    try {
        const history = await fetchHistoryBase({
            user_id: userId,
            conversation_id: conversationId,
            limit,
            offset,
        });
        return history;
    } catch (error) {
        throw error;
    }
};

// 格式化消息的辅助函数
export const formatMessages = (apiMessages: APIMessage[], userImageUrl?: string): Message[] => {
    return apiMessages.map((msg: APIMessage): Message => {
        // 基础消息属性
        const baseMessage = {
            message_id: msg.message_id,
            content: msg.content,
            timestamp: msg.timestamp,
            status: msg.status,
            parent_id: msg.parent_id,
            children_ids: msg.children_ids,
            version: msg.version,
            modified_count: msg.modified_count,
            type: msg.role === 'assistant' ? 'bot' : 'user',
            avatarUrl: msg.role === 'assistant' 
                ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix' 
                : userImageUrl || '',
            isStreaming: false,
        } as Message;

        // 如果是用户消息，直接返回
        if (msg.role === 'user') {
            return baseMessage;
        }

        // 对于 bot 消息，添加临时字段用于插件和 Agent 处理
        if (msg.role === 'assistant') {
            console.log('格式化消息:', {
                messageId: msg.message_id,
                agentResponses: msg.agent_responses,
                moreContent: msg.more_content
            });

            return {
                ...baseMessage,
                _temp_plugin_responses: msg.plugin_responses || [],
                _temp_more_content: msg.more_content || [],  // 确保传递 more_content
                _temp_agent_responses: msg.agent_responses || []
            };
        }

        return baseMessage;
    });
};

// 创建用户消息的辅助函数
export const createUserMessage = (content: string, userImageUrl?: string): Message => ({
    type: 'user',
    content,
    avatarUrl: userImageUrl || 'https://github.com/shuakami.png',
});

// 创建机器人消息的辅助函数
export const createBotMessage = (content: string = '', isStreaming: boolean = true): Message => ({
    type: 'bot',
    content,
    avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
    isStreaming,
});

// 创建错误消息的辅助函数
export const createErrorMessage = (content: string): Message => ({
    type: 'error',
    content,
    avatarUrl: '',
});