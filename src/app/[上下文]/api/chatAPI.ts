import { sendMessage as sendMessageAPIBase } from '@/app/[消息发送]/send_message';
import { stopStream as stopStreamAPIBase } from '@/app/[对话管理]/stop_stream';
import { fetchHistory as fetchHistoryBase } from "@/app/[拉取历史]/fetch_history";
import { handleStream } from '@/app/[流式处理]/stream';
import { SendMessageResponse, StreamChunk, FinalInfo, APIMessage } from '@/types/stream';

// 错误类
export class APIError extends Error {
    constructor(
        message: string,
        public code: string,
        public status?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// API 接口定义
export interface SendMessageParams {
    userInput: string;
    userId: string;
    token: string;
    conversationId?: string | null;
    model?: string;
    files?: { file_id: string; filename: string; file_type: string }[];  // 统一使用 files
    onInitialResponse: (response: SendMessageResponse) => void;
    onChunk: (chunk: StreamChunk) => void;
    onFinalInfo: (info: FinalInfo) => void;
    onError: (error: APIError) => void;
    signal: AbortSignal;
}

export interface FetchHistoryParams {
    userId: string;
    conversationId: string;
    limit: number;
    offset: number;
}

export interface FetchHistoryResponse {
    messages: APIMessage[];
    total_count: number;
}

// 新增修改消息的接口参数定义
export interface ModifyMessageParams {
    messageId: string;
    userId: string;
    conversationId: string;
    newContent: string;
    token: string;
    onInitialResponse: (response: SendMessageResponse) => void;
    onChunk: (chunk: StreamChunk) => void;
    onFinalInfo: (info: FinalInfo) => void;
    onError: (error: APIError) => void;
    signal: AbortSignal;
}

// API 实现
export const sendMessageAPI = async ({
    userInput,
    userId,
    token,
    conversationId,
    model,
    files,
    onInitialResponse,
    onChunk,
    onFinalInfo,
    onError,
    signal
}: SendMessageParams): Promise<void> => {
    console.log('ChatAPI 接收到的参数:', { userInput, userId, conversationId, model, files });
    try {
        await sendMessageAPIBase(
            {
                user_input: userInput,
                user_id: userId,
                conversation_id: conversationId || undefined,
                model,
                files  // 直接传递 files
            },
            token,
            onInitialResponse,
            onChunk,
            onFinalInfo,
            (error) => onError(new APIError(
                error.message || 'Failed to send message',
                'SEND_MESSAGE_ERROR',
                error.status,
                error
            )),
            signal
        );
    } catch (error: any) {
        throw new APIError(
            error.message || 'Failed to send message',
            'SEND_MESSAGE_ERROR',
            error.status,
            error
        );
    }
};

export const stopStreamAPI = async (
    conversationId: string, 
    messageId: string, 
    userId: string
): Promise<void> => {
    try {
        await stopStreamAPIBase(conversationId, messageId, userId);
    } catch (error: any) {
        throw new APIError(
            error.message || 'Failed to stop stream',
            'STOP_STREAM_ERROR',
            error.status,
            error
        );
    }
};

export const fetchHistoryAPI = async ({
    userId,
    conversationId,
    limit,
    offset
}: FetchHistoryParams): Promise<FetchHistoryResponse> => {
    try {
        return await fetchHistoryBase({
            user_id: userId,
            conversation_id: conversationId,
            limit,
            offset,
        });
    } catch (error: any) {
        throw new APIError(
            error.message || 'Failed to fetch history',
            'FETCH_HISTORY_ERROR',
            error.status,
            error
        );
    }
};

// 新增修改消息的API实现
export const modifyMessageAPI = async ({
    messageId,
    userId,
    conversationId,
    newContent,
    token,
    onInitialResponse,
    onChunk,
    onFinalInfo,
    onError,
    signal
}: ModifyMessageParams): Promise<void> => {
    try {
        const API_BASE_URL = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_PROD_API_URL
            : process.env.NEXT_PUBLIC_LOCAL_API_URL;

        const response = await fetch(`${API_BASE_URL}/api/v1/message/modify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                message_id: messageId,
                user_id: userId,
                conversation_id: conversationId,
                new_content: newContent,
            }),
            signal,
        });

        if (response.status === 401) {
            const error = new Error('身份验证失败');
            onError(new APIError(error.message, 'UNAUTHORIZED', 401));
            throw error;
        }

        if (!response.body) {
            throw new Error('浏览器不支持流式响应。');
        }

        await handleStream(
            response.body,
            onInitialResponse,
            onChunk,
            onFinalInfo,
            (error) => onError(new APIError(
                error.message || 'Failed to modify message',
                'MODIFY_MESSAGE_ERROR',
                error.status,
                error
            ))
        );
    } catch (error: any) {
        throw new APIError(
            error.message || 'Failed to modify message',
            'MODIFY_MESSAGE_ERROR',
            error.status,
            error
        );
    }
};

export * from './messageUtils';