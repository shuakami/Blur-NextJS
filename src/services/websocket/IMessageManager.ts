import { DocumentContent, ChangeSet } from '@/types/book';
import { AppError } from '@/services/error/errorHandler';

// 消息类型
export type MessageType =
    | 'content_change'
    | 'cursor_move'
    | 'user_connected'
    | 'user_disconnected'
    | 'online_users'
    | 'join_room'
    | 'leave_room'
    | 'message_ack'
    | 'version_update'
    | 'title_update'
    | 'error'
    | 'pong';

// 基础消息接口
export interface BaseMessage {
    type: MessageType;
    message_id?: string;
    timestamp?: number;
    book_id?: string;
    metadata?: any;
    code?: number;
    message?: string;
    version?: number;
    details?: {
        missing_versions?: number[];
        [key: string]: any;
    };
}

// 内容变更消息
export interface ContentChangeMessage extends BaseMessage {
    type: 'content_change';
    content: DocumentContent;
    changes: ChangeSet;
}

// 消息确认
export interface MessageAck extends BaseMessage {
    type: 'message_ack';
    status: 'success' | 'error';
    version: number;
}

// 重试事件数据
export interface RetryEventData {
    messageId: string;
    bookId?: string;
    type: MessageType;
    retryCount: number;
    nextRetryTime: number;
}

// 消息管理器事件
export interface MessageManagerEvents {
    retry_scheduled: (info: RetryEventData) => void;
}

/**
 * 消息管理器接口
 */
export interface IMessageManager {
    // 事件监听
    on<K extends keyof MessageManagerEvents>(
        event: K,
        listener: MessageManagerEvents[K]
    ): void;
    
    off<K extends keyof MessageManagerEvents>(
        event: K,
        listener: MessageManagerEvents[K]
    ): void;

    // 消息处理
    sendMessage(ws: WebSocket, message: BaseMessage | ContentChangeMessage): Promise<boolean>;
    handleAck(messageId: string, ack: MessageAck): void;
    handleError(messageId: string, error: AppError): void;
    shouldProcessMessage(message: BaseMessage): boolean;

    // 连接状态
    updateConnectionStatus(connected: boolean): void;
    isConnected(): boolean;

    // 版本管理
    getCurrentVersion(): number;
    getCurrentContent(): DocumentContent | null;
    updateVersion(version: number): void;
    updateContent(content: DocumentContent): void;

    // 重置
    clearAllMessages(): void;
    resetVersion(): void;
}