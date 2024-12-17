// src/app/[上下文]/DialogProcessor.ts

import { Message } from '@/types/stream';
import { v4 as uuidv4 } from 'uuid';

// 定义插件接口
export interface DialogProcessorPlugin {
    onCreateUserMessage?: (message: Partial<Message>) => Partial<Message>;
    onCreateBotMessage?: (message: Partial<Message>) => Partial<Message>;
    onCreateErrorMessage?: (message: Partial<Message>) => Partial<Message>;
    onUpdateMessage?: (message: Message) => Message;
    onStreamChunk?: (chunk: {
        content: string,
        currentFullContent: string,
        isFirstChunk: boolean,
        isFinalChunk: boolean
    }) => {
        updates?: Partial<Message>;
        shouldUpdateCurrentBot?: boolean;
        continueProcessing?: boolean;
    };
}

// DialogProcessor 类
export class DialogProcessor {
    private plugins: DialogProcessorPlugin[] = [];

    // 注册插件
    registerPlugin(plugin: DialogProcessorPlugin) {
        this.plugins.push(plugin);
    }

    // 创建用户消息
    createUserMessage(content: string, avatarUrl?: string, files?: File[]): Message {
        let message: Partial<Message> = {
            message_id: uuidv4(),
            type: 'user',
            content,
            avatarUrl: avatarUrl || '/avatars/user.png',
            timestamp: Date.now(),
            files,
            status: 'active'
        };

        this.plugins.forEach(plugin => {
            if (plugin.onCreateUserMessage) {
                message = plugin.onCreateUserMessage(message);
            }
        });

        return message as Message;
    }

    // 创建机器人消息
    createBotMessage(content: string = '', isStreaming: boolean = true): Message {
        let message: Partial<Message> = {
            message_id: uuidv4(),
            type: 'bot',
            content,
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
            isStreaming,
            timestamp: Math.floor(Date.now() / 1000),
        };

        this.plugins.forEach(plugin => {
            if (plugin.onCreateBotMessage) {
                message = plugin.onCreateBotMessage(message);
            }
        });

        return message as Message;
    }

    // 创建错误消息
    createErrorMessage(content: string): Message {
        let message: Partial<Message> = {
            message_id: uuidv4(),
            type: 'error',
            content,
            avatarUrl: '',
            timestamp: Math.floor(Date.now() / 1000),
        };

        this.plugins.forEach(plugin => {
            if (plugin.onCreateErrorMessage) {
                message = plugin.onCreateErrorMessage(message);
            }
        });

        return message as Message;
    }

    // 更新消息
    updateMessage(message: Message): Message {
        this.plugins.forEach(plugin => {
            if (plugin.onUpdateMessage) {
                message = plugin.onUpdateMessage(message);
            }
        });
        return message;
    }

    // 添加处理流式块的方法
    processStreamChunk(chunk: {
        content: string,
        currentFullContent: string,
        isFirstChunk: boolean,
        isFinalChunk: boolean
    }): { updates?: Partial<Message>; shouldUpdateCurrentBot?: boolean } | null {
        for (const plugin of this.plugins) {
            if (plugin.onStreamChunk) {
                const result = plugin.onStreamChunk(chunk);
                
                if (result.updates) {
                    return {
                        updates: result.updates,
                        shouldUpdateCurrentBot: result.shouldUpdateCurrentBot
                    };
                }
                
                if (result.continueProcessing === false) {
                    break;
                }
            }
        }
        return null;
    }
}

// 导出一个默认的 DialogProcessor 实例
const dialogProcessor = new DialogProcessor();
export default dialogProcessor;
