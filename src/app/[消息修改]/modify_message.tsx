import { handleStream } from '@/app/[流式处理]/stream';
import { SendMessageResponse, StreamChunk, FinalInfo } from '@/types/stream';
import { getTranslate } from '@/hooks/useTranslation';

interface ModifyMessageParams {
    conversation_id: string;
    message_id: string;
    user_id: string;
    new_content: string;
}

export const modifyMessage = async (
    params: ModifyMessageParams,
    jwtToken: string,
    onInitialResponse: (response: SendMessageResponse) => void,
    onChunkReceived: (chunk: StreamChunk) => void,
    onFinalInfo?: (finalInfo: FinalInfo) => void,
    onError?: (error: any) => void,
    signal?: AbortSignal
) => {
    const t = getTranslate();
    try {
        const API_BASE_URL = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_PROD_API_URL
            : process.env.NEXT_PUBLIC_LOCAL_API_URL;

        const response = await fetch(`${API_BASE_URL}/api/v1/message/modify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(params),
            signal,
        });

        if (!response.body) {
            throw new Error(t('浏览器不支持流式响应。'));
        }

        await handleStream(
            response.body,
            onInitialResponse,
            onChunkReceived,
            onFinalInfo,
            onError
        );
    } catch (error) {
        console.error(t('修改消息失败:'), error);
        if (onError) {
            onError(error);
        }
        throw error;
    }
}; 