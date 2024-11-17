import { Message } from '@/types/stream';

// 消息状态类型
export type MessageStatus = 'pending' | 'sent' | 'failed' | 'retrying';

// 带状态的消息类型
export interface MessageWithStatus extends Message {
    sendStatus?: MessageStatus;
    error?: {
        code: number;
        message: string;
    };
}

// 可重试消息的接口
export interface RetryableMessage {
    message_id: string;
    type: string;
    content: string;
    sendStatus: MessageStatus;
    retryCount: number;
    error?: {
        code: number;
        message: string;
    };
    userMessage: Message;  // 原始用户消息
    botMessage?: Message;  // 对应的机器人消息（可选）
}

// 创建带状态的消息
export const createMessageWithStatus = (
    message: Message, 
    status: MessageStatus = 'pending'
): MessageWithStatus => ({
    ...message,
    sendStatus: status,
});

// 更新消息状态
export const updateMessageStatus = (
    message: MessageWithStatus,
    status: MessageStatus,
    error?: { code: number; message: string }
): MessageWithStatus => ({
    ...message,
    sendStatus: status,
    error: error,
});