import { useState, useRef, useCallback } from 'react';
import { stopStream as stopStreamAPI } from '@/app/[对话管理]/stop_stream';
import { Message } from '@/types/stream';

export const useStreamControl = () => {
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopStreaming = useCallback(async (
        conversationId: string | null,
        userId: string | null,
        messages: Message[],
        updateMessages: (messages: Message[]) => void
    ) => {
        if (!conversationId || !userId) {
            console.error('无法停止流式传输，缺少 conversationId 或 userId');
            return;
        }

        const lastBotMessage = messages.slice().reverse()
            .find((msg) => msg.type === 'bot' && msg.isStreaming);

        if (!lastBotMessage) {
            console.error('无法停止流式传输，未找到正在 streaming 的消息');
            return;
        }

        try {
            await stopStreamAPI(conversationId, lastBotMessage.id || '', userId);

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            setIsStreaming(false);

            updateMessages(messages.map(msg => 
                msg.type === 'bot' && msg.isStreaming 
                    ? { ...msg, isStreaming: false }
                    : msg
            ));
        } catch (error) {
            console.error('停止流式传输失败:', error);
        }
    }, []);

    return {
        isStreaming,
        setIsStreaming,
        abortControllerRef,
        stopStreaming
    };
}; 