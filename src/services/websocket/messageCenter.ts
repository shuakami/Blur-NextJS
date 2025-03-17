/**
 * MessageCenter - WebSocket 消息管理中心
 * 
 * @class MessageCenter
 * @implements IMessageManager
 * 
 * @property pendingMessages - 等待确认的消息队列
 * @property messageCache - 消息缓存，防止重复处理
 * @property versionManager - 版本管理器实例
 * @property wsConnected - WebSocket 连接状态
 * @property retryManager - 重试管理器实例
 * 
 * @method sendMessage - 发送消息，支持重试
 * @method handleAck - 处理消息确认
 * @method handleError - 处理错误消息
 * @method updateConnectionStatus - 更新连接状态
 * @method clearAllMessages - 清理所有待处理消息
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { AppError } from '@/services/error/errorHandler';
import { DocumentContent, ChangeSet } from '@/types/book';
import { IVersionManager } from '../version/IVersionManager';
import { IMessageManager, BaseMessage, ContentChangeMessage, MessageAck, MessageType, MessageManagerEvents } from './IMessageManager';
import { RetryManager, RetryConfig } from '../retry/RetryManager';

/**
 * 等待确认的消息
 */
interface PendingMessage {
    id: string;
    type: MessageType;
    timestamp: number;
    resolve: (value: boolean) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
    content?: DocumentContent;
    changes?: ChangeSet;
    bookId?: string;
}

/**
 * MessageCenter 负责管理 WebSocket 消息的发送、重试、确认等逻辑
 */
export class MessageCenter implements IMessageManager {
    private static instance: MessageCenter;
    private pendingMessages = new Map<string, PendingMessage>();
    private messageCache = new Set<string>();
    private versionManager: IVersionManager;
    private wsConnected: boolean = false;
    private retryManager: RetryManager;
    private emitter: EventEmitter;

    private constructor(versionManager: IVersionManager) {
        this.versionManager = versionManager;
        this.emitter = new EventEmitter();

        const retryConfig: RetryConfig = {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 10000,
            backoffFactor: 2
        };
        this.retryManager = new RetryManager(retryConfig);

        // 监听重试事件
        this.retryManager.on((data) => {
            this.emit('retry_scheduled', data);
        });

        console.log('[MessageCenter] 初始化消息中心');
    }

    static getInstance(versionManager: IVersionManager): MessageCenter {
        if (!this.instance) {
            this.instance = new MessageCenter(versionManager);
        }
        return this.instance;
    }

    // 实现 IMessageManager 接口

    on<K extends keyof MessageManagerEvents>(
        event: K,
        listener: MessageManagerEvents[K]
    ): void {
        this.emitter.on(event, listener);
    }

    off<K extends keyof MessageManagerEvents>(
        event: K,
        listener: MessageManagerEvents[K]
    ): void {
        this.emitter.off(event, listener);
    }

    private emit<K extends keyof MessageManagerEvents>(
        event: K,
        data: Parameters<MessageManagerEvents[K]>[0]
    ) {
        this.emitter.emit(event, data);
    }

    getCurrentVersion(): number {
        return this.versionManager.getCurrentVersion();
    }

    getCurrentContent(): DocumentContent | null {
        return this.versionManager.getCurrentContent();
    }

    updateVersion(version: number) {
        this.versionManager.updateVersion(version);
    }

    updateContent(content: DocumentContent) {
        this.versionManager.updateVersion(content.version, content);
    }

    updateConnectionStatus(connected: boolean) {
        if (this.wsConnected !== connected) {
            console.log('[MessageCenter] WebSocket连接状态更新:', connected);
            this.wsConnected = connected;
            this.versionManager.updateConnectionStatus(connected);

            if (!connected) {
                this.clearAllMessages();
            }
        }
    }

    isConnected(): boolean {
        return this.wsConnected;
    }

    async sendMessage(ws: WebSocket, message: BaseMessage | ContentChangeMessage): Promise<boolean> {
        if (!this.wsConnected) {
            console.error('[MessageCenter] WebSocket未连接，无法发送消息');
            return false;
        }
        return this.sendMessageWithRetry(ws, message, 0);
    }

    private async sendMessageWithRetry(
        ws: WebSocket,
        message: BaseMessage | ContentChangeMessage,
        retryCount: number
    ): Promise<boolean> {
        if (!this.wsConnected) {
            console.error('[MessageCenter] WebSocket未连接，取消消息发送');
            return false;
        }

        // 某些消息类型不需要等待 ACK
        const noAckTypes = ['join_room', 'leave_room', 'cursor_move'];
        const needsAck = !noAckTypes.includes(message.type);

        // 如果是 content_change，需要分配新版本号
        if (message.type === 'content_change') {
            const contentChangeMsg = message as ContentChangeMessage;
            const { content, newVersion } = this.versionManager.prepareNewVersion(
                contentChangeMsg.content
            );

            contentChangeMsg.content = content;
            contentChangeMsg.changes = {
                ...contentChangeMsg.changes,
                version: newVersion,
            };
            message.version = newVersion;
        }

        const messageId = message.message_id || uuidv4();
        const enhancedMessage = {
            ...message,
            message_id: messageId,
            timestamp: Date.now(),
        };

        // 如果不需要 ACK,直接发送并返回
        if (!needsAck) {
            try {
                ws.send(JSON.stringify(enhancedMessage));
                return true;
            } catch (error) {
                console.error('[MessageCenter] 发送消息失败:', error);
                return false;
            }
        }

        return new Promise((resolve, reject) => {
            let isHandled = false;

            const timeout = setTimeout(() => {
                if (!isHandled) {
                    isHandled = true;
                    this.clearMessage(messageId);

                    if (this.retryManager.canRetry(retryCount) && this.wsConnected) {
                        const { timer } = this.retryManager.scheduleRetry(
                            messageId,
                            message.type,
                            message.book_id,
                            retryCount
                        );

                        // 重新发送消息
                        this.sendMessageWithRetry(ws, message, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        console.error(
                            `[MessageCenter] 消息 ${messageId} 发送失败，已达到最大重试次数或WebSocket未连接`
                        );
                        resolve(false);
                    }
                }
            }, 5000);

            try {
                this.pendingMessages.set(messageId, {
                    id: messageId,
                    type: message.type,
                    timestamp: Date.now(),
                    resolve: (success: boolean) => {
                        if (!isHandled) {
                            isHandled = true;
                            clearTimeout(timeout);
                            resolve(success);
                        }
                    },
                    reject: (error: Error) => {
                        if (!isHandled) {
                            isHandled = true;
                            clearTimeout(timeout);
                            reject(error);
                        }
                    },
                    timeout,
                    content:
                        message.type === 'content_change'
                            ? (message as ContentChangeMessage).content
                            : undefined,
                    changes:
                        message.type === 'content_change'
                            ? (message as ContentChangeMessage).changes
                            : undefined,
                    bookId: message.book_id,
                });

                ws.send(JSON.stringify(enhancedMessage));
            } catch (error) {
                if (!isHandled) {
                    isHandled = true;
                    clearTimeout(timeout);
                    this.clearMessage(messageId);
                    resolve(false);
                }
            }
        });
    }

    handleAck(messageId: string, ack: MessageAck) {
        console.log('[MessageCenter] 收到消息确认:', {
            messageId,
            status: ack.status,
            version: ack.version,
        });

        const pending = this.pendingMessages.get(messageId);
        if (!pending) return;

        if (ack.status === 'success') {
            if (pending.content) {
                this.versionManager.confirmVersion(ack.version, pending.content);
            }
            pending.resolve(true);
            this.clearMessage(messageId);
        } else {
            pending.reject(new Error('服务器拒绝了更新'));
            this.clearMessage(messageId);
        }
    }

    handleError(messageId: string, error: AppError) {
        const pending = this.pendingMessages.get(messageId);
        if (pending) {
            pending.reject(error);
        }
    }

    private clearMessage(messageId: string) {
        const pending = this.pendingMessages.get(messageId);
        if (pending) {
            clearTimeout(pending.timeout);
            this.pendingMessages.delete(messageId);
            this.retryManager.cancelRetry(messageId);
        }
    }

    shouldProcessMessage(message: BaseMessage): boolean {
        if (!message.timestamp) return true;

        const key = `${message.type}-${message.timestamp}`;
        if (this.messageCache.has(key)) {
            return false;
        }

        this.messageCache.add(key);
        setTimeout(() => this.messageCache.delete(key), 5000);
        return true;
    }

    clearAllMessages() {
        this.pendingMessages.forEach((msg) => {
            clearTimeout(msg.timeout);
            msg.reject(new Error('WebSocket连接已关闭'));
        });
        this.pendingMessages.clear();
        this.messageCache.clear();
        this.retryManager.cancelAll();
        this.versionManager.reset();
    }

    resetVersion(): void {
        console.log('[MessageCenter] 重置版本管理器');
        this.versionManager.reset();
    }
}
