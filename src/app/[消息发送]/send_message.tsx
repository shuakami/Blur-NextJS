// src/app/消息发送/send_message.tsx

import {handleStream} from '@/app/[流式处理]/stream';
import {SendMessageParams, FinalInfo, StreamChunk, SendMessageResponse} from '@/types/stream';

// 设置 API 基础 URL 和端口
const API_BASE_URL = 'http://localhost:33413';  // 确保使用正确的端口

export const sendMessage = async (
    params: SendMessageParams,
    onInitialResponse: (response: SendMessageResponse) => void,
    onChunkReceived: (chunk: StreamChunk) => void,
    onFinalInfo?: (finalInfo: FinalInfo) => void,
    onError?: (error: any) => void
) => {
    try {
        // 构建请求体
        const requestBody: Record<string, any> = {
            user_input: params.user_input,
            topic: 'luoxiaohei',
            user_id: params.user_id || 'anonymous_user',
        };

        // 如果传入了 conversation_id，则添加到请求体中
        if (params.conversation_id) {
            requestBody.conversation_id = params.conversation_id;
        }

        // 发送 POST 请求到 localhost:33413
        const response = await fetch(`${API_BASE_URL}/api/v1/message/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.body) {
            throw new Error('浏览器不支持流式响应。');
        }

        // 处理流式响应
        await handleStream(
            response.body,
            onInitialResponse,
            onChunkReceived,
            onFinalInfo,
            onError
        );
    } catch (error) {
        console.error('发送消息失败:', error);
        if (onError) {
            onError(error);
        }
        throw error;
    }
};
