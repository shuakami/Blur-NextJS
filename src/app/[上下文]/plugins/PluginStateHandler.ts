import dialogProcessor from '../core/DialogProcessor';
import { Message } from '@/types/stream';

const PluginStateHandler = {
    onStreamChunk: ({ content, currentFullContent, isFirstChunk, isFinalChunk }: { content: string, currentFullContent: string, isFirstChunk: boolean, isFinalChunk: boolean }) => {
        try {
            const chunk = JSON.parse(content);
            let updates: Partial<Message> | null = null;

            console.log('接收到的响应:', chunk);
            
            // 处理插件调用状态 - 当有 plugin_id 和 plugin_name，但没有 plugin_response 时
            if (chunk.plugin_id && chunk.plugin_name && !chunk.plugin_response) {
                updates = {
                    plugin_id: chunk.plugin_id,
                    plugin_name: chunk.plugin_name,
                    plugin_status: 'calling',
                    call_index: chunk.call_index
                };
                console.log('插件调用状态更新:', updates);
            }
            
            // 处理插件响应状态
            if (chunk.plugin_response) {
                updates = {
                    plugin_response: chunk.plugin_response,
                    plugin_status: 'response',
                    call_index: chunk.call_index
                };
                console.log('插件响应状态更新:', updates);
            }

            // 如果有更新，返回更新信息
            if (updates) {
                return {
                    updates,
                    shouldUpdateCurrentBot: true,
                    continueProcessing: true
                };
            }
        } catch (e) {
            console.error('解析错误:', e);
            // 如果不是 JSON 或不是插件相关的响应，继续处理
            return { continueProcessing: true };
        }

        return { continueProcessing: true };
    }
};

// 注册插件
dialogProcessor.registerPlugin(PluginStateHandler);

export default PluginStateHandler;