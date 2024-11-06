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
    return apiMessages.map((msg: APIMessage) => ({
        id: msg.message_id,
        type: msg.role === 'assistant' ? 'bot' : 'user',
        content: msg.content,
        avatarUrl: msg.role === 'assistant' 
            ? 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix' 
            : userImageUrl || '',
        timestamp: msg.timestamp * 1000,
        isStreaming: false,
    }));
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