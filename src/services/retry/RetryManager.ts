/**
 * RetryManager - 消息重试管理器
 * 
 * @class RetryManager
 * @implements 消息重试策略管理，支持指数退避算法
 * 
 * @property config - 重试配置
 *   - maxRetries: 最大重试次数
 *   - initialDelay: 初始延迟时间(ms)
 *   - maxDelay: 最大延迟时间(ms)
 *   - backoffFactor: 退避因子
 * 
 * @method on - 注册重试事件监听器
 * @method off - 移除重试事件监听器
 * @method scheduleRetry - 调度下一次重试
 * @method canRetry - 检查是否可以继续重试
 */

import { EventEmitter } from 'events';
import { MessageType } from '../websocket/IMessageManager';

// 重试配置接口
export interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

// 重试事件数据
export interface RetryEventData {
    messageId: string;
    bookId?: string;
    type: MessageType;
    retryCount: number;
    nextRetryTime: number;
}

// 重试事件处理器
export type RetryEventHandler = (data: RetryEventData) => void;

/**
 * 重试管理器
 * 负责处理消息重试的通用逻辑
 */
export class RetryManager {
    private readonly config: RetryConfig;
    private emitter: EventEmitter;
    private retryTimers: Map<string, NodeJS.Timeout>;  // 新增：存储消息ID和定时器的映射

    constructor(config: RetryConfig) {
        this.config = config;
        this.emitter = new EventEmitter();
        this.retryTimers = new Map();  // 初始化映射
    }

    /**
     * 监听重试事件
     */
    on(handler: RetryEventHandler): void {
        this.emitter.on('retry', handler);
    }

    /**
     * 取消监听重试事件
     */
    off(handler: RetryEventHandler): void {
        this.emitter.off('retry', handler);
    }

    /**
     * 计算重试延迟
     */
    private calculateRetryDelay(retryCount: number): number {
        return Math.min(
            this.config.initialDelay *
            Math.pow(this.config.backoffFactor, retryCount),
            this.config.maxDelay
        );
    }

    /**
     * 调度重试
     */
    scheduleRetry(
        messageId: string,
        type: MessageType,
        bookId?: string,
        retryCount: number = 0
    ): { timer: NodeJS.Timeout; nextRetryTime: number } {
        // 先清除已存在的定时器
        this.cancelRetry(messageId);

        const delay = this.calculateRetryDelay(retryCount);
        const nextRetryTime = Date.now() + delay;

        const timer = setTimeout(() => {
            this.retryTimers.delete(messageId);  // 定时器触发后自动清理
            this.emitter.emit('retry', {
                messageId,
                bookId,
                type,
                retryCount: retryCount + 1,
                nextRetryTime
            });
        }, delay);

        this.retryTimers.set(messageId, timer);  // 保存定时器引用

        return { timer, nextRetryTime };
    }

    /**
     * 取消特定消息的重试
     */
    cancelRetry(messageId: string): void {
        const timer = this.retryTimers.get(messageId);
        if (timer) {
            clearTimeout(timer);
            this.retryTimers.delete(messageId);
        }
    }

    /**
     * 取消所有重试
     */
    cancelAll(): void {
        this.retryTimers.forEach((timer) => clearTimeout(timer));
        this.retryTimers.clear();
    }

    /**
     * 检查是否可以重试
     */
    canRetry(retryCount: number): boolean {
        return retryCount < this.config.maxRetries;
    }
} 