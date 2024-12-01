import { Dispatch } from 'react';
import { Action } from './chatReducer';
import { StreamChunk, Message } from '@/types/stream';
import { MessageStatus } from './messageStatus';
import dialogProcessor from './DialogProcessor';

// 插件调用接口
interface PluginCall {
    id: number;
    name: string;
    call_index: number;
}

// 消息更新接口
interface MessageUpdate {
    message_id: string;
    updates: Partial<Message & { 
        sendStatus?: MessageStatus;
        retryCount?: number;
    }>;
}

// 流式消息处理器（处理流式响应，包括普通文本、插件调用和Agent响应）
export class StreamMessageHandler {
    private currentBotMessageId: string | null = null;  // 当前Bot消息ID
    private currentBotContent: string = '';  // 当前Bot消息内容
    private pluginCalls: PluginCall[] = [];  // 插件调用队列
    private dispatch: Dispatch<Action>;  // 状态分发器
    private readonly logger: Console;  // 日志工具


    constructor(dispatch: Dispatch<Action>) {
        this.dispatch = dispatch;
        this.logger = process.env.NODE_ENV === 'production' 
            ? console
            : {
                ...console,
                log: (...args) => console.log('[StreamHandler]', ...args),
                error: (...args) => console.error('[StreamHandler]', ...args)
              };
    }

    // 更新内部状态
    private updateState(updates: Partial<{
        messageId: string | null;
        content: string;
        pluginCalls: PluginCall[];
    }>) {
        if (updates.messageId !== undefined) this.currentBotMessageId = updates.messageId;
        if (updates.content !== undefined) this.currentBotContent = updates.content;
        if (updates.pluginCalls) this.pluginCalls = updates.pluginCalls;
    }

    // 消息分发
    private dispatchUpdate(update: MessageUpdate) {
        if (!update.message_id) return;
        this.dispatch({ type: 'UPDATE_MESSAGE', payload: update });
    }

    // 设置当前Bot消息ID
    setCurrentBotMessageId(messageId: string | null) {
        this.updateState({ messageId });
        this.logger.log('Bot message ID updated:', messageId);
    }

    setCurrentBotContent(content: string) {
        this.updateState({ content });
    }

    getCurrentBotMessageId() {
        return this.currentBotMessageId;
    }

    getCurrentBotContent() {
        return this.currentBotContent;
    }

    resetState() {
        this.updateState({
            messageId: null,
            content: '',
            pluginCalls: []
        });
    }

    // 处理插件的响应结果，更新内容和插件调用状态
    private handlePluginResponse(result: any, content: string): string {
        if (!result.updates) return content;

        const { plugin_status, call_index, plugin_id, plugin_name, plugin_response } = result.updates;

        // 如果插件状态为Response，处理相应的调用索引
        if (plugin_status === 'response' && call_index !== undefined) {
            const matchedCallIndex = this.pluginCalls.findIndex(call => call.call_index === call_index);
            
            if (matchedCallIndex !== -1) {
                const matchedCall = this.pluginCalls[matchedCallIndex];
                const callMarker = `<plugin-data>{"status":"calling","plugin_id":${matchedCall.id},"plugin_name":"${matchedCall.name}","call_index":${matchedCall.call_index}}</plugin-data>`;
                content = content.replace(callMarker, '');
                
                // 移除Calling的插件调用
                this.pluginCalls = [
                    ...this.pluginCalls.slice(0, matchedCallIndex),
                    ...this.pluginCalls.slice(matchedCallIndex + 1)
                ];
            }
        }

        // 如果插件状态为Calling，添加新的插件调用
        if (plugin_status === 'calling' && plugin_id && plugin_name && call_index) {
            this.pluginCalls = [...this.pluginCalls, { id: plugin_id, name: plugin_name, call_index }];
        }

        return `${content}<plugin-data>${JSON.stringify({
            status: plugin_status,
            plugin_id,
            plugin_name,
            call_index,
            plugin_response
        })}</plugin-data>`;
    }

    // Agent响应处理
    private handleAgentResponse(chunk: StreamChunk): boolean {
        if (!chunk.agent_response || !this.currentBotMessageId) return false;

        const { agent_response } = chunk;
        const agentInfo = {
            type: 'agent',
            call_instance_id: agent_response.call_instance_id,
            agent_id: agent_response.agent_id,
            agent_name: agent_response.agent_name,
            data: agent_response.data,
            status: agent_response.status,
            timestamp: agent_response.timestamp
        };

        const updatedContent = this.currentBotContent + 
            chunk.content + 
            `<agent-data>${JSON.stringify(agentInfo)}</agent-data>`;

        this.dispatchUpdate({
            message_id: this.currentBotMessageId,
            updates: {
                content: updatedContent,
                agent_response,
                agent_id: agent_response.agent_id,
                agent_name: agent_response.agent_name,
                agent_status: 'response'
            }
        });

        this.updateState({ content: updatedContent });
        return true;
    }

    // 流式消息处理
    handleStreamChunk(chunk: StreamChunk): string {
        if (!this.currentBotMessageId) return this.currentBotContent;

        try {
            if (chunk.agent_response) {
                this.handleAgentResponse(chunk);
                return this.currentBotContent;
            }

            const result = dialogProcessor.processStreamChunk({
                content: JSON.stringify(chunk),
                currentFullContent: this.currentBotContent,
                isFirstChunk: this.currentBotContent === '',
                isFinalChunk: chunk.is_final_chunk
            });

            if (result?.updates && result.shouldUpdateCurrentBot) {
                const updatedContent = this.handlePluginResponse(result, this.currentBotContent);
                
                this.dispatchUpdate({
                    message_id: this.currentBotMessageId,
                    updates: {
                        ...result.updates,
                        content: updatedContent
                    }
                });

                this.updateState({ content: updatedContent });
            }

            if (chunk.content) {
                const newContent = this.currentBotContent + chunk.content;
                
                this.dispatchUpdate({
                    message_id: this.currentBotMessageId,
                    updates: { content: newContent }
                });

                this.updateState({ content: newContent });
            }

            return this.currentBotContent;
        } catch (error) {
            this.logger.error('Error handling stream chunk:', error);
            return this.currentBotContent;
        }
    }
}