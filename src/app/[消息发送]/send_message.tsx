import {handleStream} from '@/app/[流式处理]/stream';
import {SendMessageParams, FinalInfo, StreamChunk, SendMessageResponse} from '@/types/stream';
import {getTranslate} from '@/hooks/useTranslation';

// 设置 API 基础 URL 和端口
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : process.env.NEXT_PUBLIC_LOCAL_API_URL;

export const sendMessage = async (
    params: SendMessageParams, jwtToken: string, onInitialResponse: (response: SendMessageResponse) => void, onChunkReceived: (chunk: StreamChunk) => void, onFinalInfo?: (finalInfo: FinalInfo) => void, onError?: (error: any) => void, signal?: AbortSignal) => {
    const t = getTranslate();

    // 自定义的 onInitialResponse 处理函数
    const handleInitialResponse = (response: SendMessageResponse) => {
        // 如果是新对话（没有 conversation_id），则添加到对话列表
        if (!params.conversation_id && response.conversation_id) {
            const newConversation = {
                conversation_id: response.conversation_id,
                chat_title: response.chat_title || "未命名对话",
                timestamp: Math.floor(Date.now() / 1000),
                created_timestamp: Math.floor(Date.now() / 1000)
            };

            //打印
            console.log(newConversation);
            
            // 使用全局状态更新对话列表
            window.dispatchEvent(new CustomEvent('addConversation', {
                detail: newConversation
            }));
        }
        
        // 调用原始的 onInitialResponse
        onInitialResponse(response);
    };

    try {
        // 构建请求体
        const requestBody: Record<string, any> = {
            user_input: params.user_input,
            topic: 'luoxiaohei',
            user_id: params.user_id,
        };

        // 添加 conversation_id
        if (params.conversation_id) {
            requestBody.conversation_id = params.conversation_id;
        }
        
        // 添加 parent_message_id
        if (params.parent_message_id) {
            requestBody.parent_message_id = params.parent_message_id;
        }

        // 发送 POST 请求
        const response = await fetch(`${API_BASE_URL}/api/v1/message/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`, // 使用传入的 JWT 进行身份验证
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.body) {
            throw new Error(t('浏览器不支持流式响应。'));
        }

        // 处理流式响应
        await handleStream(
            response.body,
            handleInitialResponse,
            onChunkReceived,
            onFinalInfo,
            onError
        );

    } catch (error) {
        console.error(t('发送消息失败:'), error);
        if (onError) {
            onError(error);
        }
        throw error;
    }
};
