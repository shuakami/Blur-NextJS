// src/app/[消息发送]/send_message.tsx
import React from 'react';
import apiClient from '@/api/config';
import {handleStream} from '@/app/[流式处理]/stream';

// 定义发送消息的参数类型
interface SendMessageParams {
    user_input: string;
    user_id?: string;
    conversation_id?: string;
}

// 定义发送消息的响应类型
interface SendMessageResponse {
    conversation_id: string;
    model: string;
    status: string;
    stream: StreamChunk[];
    final_info: FinalInfo | null;
    error: string | null;
    chat_title?: string;
}

interface StreamChunk {
    type: string;
    chunk_index: number;
    content: string;
    is_final_chunk: boolean;
    metadata: {
        timestamp: number;
    };
}

interface FinalInfo {
    total_tokens: number;
    generation_duration: number;
}

// 发送消息的函数
export const sendMessage = async (params: SendMessageParams) => {
    try {
        // 构建请求体
        const requestBody: any = {
            user_input: params.user_input,
            topic: 'luoxiaohei',
            user_id: params.user_id || 'anonymous_user',
        };

        // 如果传入了 conversation_id，则添加到请求体中
        if (params.conversation_id) {
            requestBody.conversation_id = params.conversation_id;
        }

        // 发送 POST 请求
        const response = await apiClient.post<SendMessageResponse>('/message/send', requestBody, {
            responseType: 'stream', // 设置响应类型为流
        });

        // 处理流式响应
        // @ts-ignore
        handleStream(response.data);

        return response.data;
    } catch (error) {
        console.error('发送消息失败:', error);
        throw error;
    }
};
