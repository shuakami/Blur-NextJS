import { Dispatch } from 'react';
import { Action } from './chatReducer';
import { AgentResponse, StreamChunk } from '@/types/stream';
import dialogProcessor from './DialogProcessor';

interface PluginCall {
    id: number;
    name: string;
    call_index: number;
}

export class StreamMessageHandler {
    private currentBotMessageId: string | null = null;
    private currentBotContent: string = '';
    private pluginCalls: PluginCall[] = [];
    private dispatch: Dispatch<Action>;

    constructor(dispatch: Dispatch<Action>) {
        this.dispatch = dispatch;
    }

    setCurrentBotMessageId(messageId: string | null) {
        this.currentBotMessageId = messageId;
        console.log(`设置当前Bot消息ID: ${messageId}`);
    }

    setCurrentBotContent(content: string) {
        this.currentBotContent = content;
        console.log(`设置当前Bot内容: ${content}`);
    }

    getCurrentBotMessageId() {
        console.log(`获取当前Bot消息ID: ${this.currentBotMessageId}`);
        return this.currentBotMessageId;
    }

    getCurrentBotContent() {
        console.log(`获取当前Bot内容: ${this.currentBotContent}`);
        return this.currentBotContent;
    }

    resetState() {
        this.currentBotMessageId = null;
        this.currentBotContent = '';
        this.pluginCalls = [];
        console.log(`重置状态`);
    }

    private handlePluginResponse(result: any, content: string) {
        if (result.updates.plugin_status === 'response' && result.updates.call_index !== undefined) {
            const matchedCallIndex = this.pluginCalls.findIndex(call => 
                call.call_index === result.updates.call_index
            );
            
            if (matchedCallIndex !== -1) {
                const matchedCall = this.pluginCalls[matchedCallIndex];
                const callMarker = `<plugin-data>{"status":"calling","plugin_id":${matchedCall.id},"plugin_name":"${matchedCall.name}","call_index":${matchedCall.call_index}}</plugin-data>`;
                content = content.replace(callMarker, '');
                
                this.pluginCalls.splice(matchedCallIndex, 1);
                console.log(`处理插件响应: ${JSON.stringify(result)}, 剩余调用: ${this.pluginCalls.length}`);
            }
        }

        if (result.updates.plugin_status === 'calling') {
            const newCall = {
                id: result.updates.plugin_id!,
                name: result.updates.plugin_name!,
                call_index: result.updates.call_index!
            };
            this.pluginCalls.push(newCall);
            console.log(`插件调用状态: ${newCall.name} 正在调用, index: ${newCall.call_index}`);
        }

        const pluginInfo = {
            status: result.updates.plugin_status,
            plugin_id: result.updates.plugin_id,
            plugin_name: result.updates.plugin_name,
            call_index: result.updates.call_index,
            plugin_response: result.updates.plugin_response
        };

        return `${content}<plugin-data>${JSON.stringify(pluginInfo)}</plugin-data>`;
    }

    private handleAgentResponse(chunk: StreamChunk) {
        if (chunk.agent_response) {
            const agentInfo = {
                type: 'agent',
                call_instance_id: chunk.agent_response.call_instance_id,
                agent_id: chunk.agent_response.agent_id,
                agent_name: chunk.agent_response.agent_name,
                data: chunk.agent_response.data,
                status: chunk.agent_response.status,
                timestamp: chunk.agent_response.timestamp
            };

            const agentMarker = `<agent-data>${JSON.stringify(agentInfo)}</agent-data>`;
            const updatedContent = this.currentBotContent + chunk.content + agentMarker;
            
            this.dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: this.currentBotMessageId || undefined,
                    updates: {
                        content: updatedContent,
                        agent_response: chunk.agent_response,
                        agent_id: chunk.agent_response.agent_id,
                        agent_name: chunk.agent_response.agent_name,
                        agent_status: 'response'
                    }
                }
            });
            
            this.currentBotContent = updatedContent;
            return true;
        }
        return false;
    }

    handleStreamChunk(chunk: StreamChunk) {
        if (!this.currentBotMessageId) return;

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
            let content = this.currentBotContent;
            content = this.handlePluginResponse(result, content);
            this.currentBotContent = content;
            
            this.dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: this.currentBotMessageId,
                    updates: {
                        ...result.updates,
                        content
                    }
                }
            });
        }

        if (chunk.content) {
            this.currentBotContent += chunk.content;
            
            this.dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                    message_id: this.currentBotMessageId,
                    updates: {
                        content: this.currentBotContent
                    }
                }
            });
        }

        return this.currentBotContent;
    }
}