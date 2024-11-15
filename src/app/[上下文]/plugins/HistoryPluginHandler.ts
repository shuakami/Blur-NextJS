import { APIMessage, Message } from '@/types/stream';
import dialogProcessor from '../core/DialogProcessor';

const HistoryPluginHandler = {
    onUpdateMessage: (message: Message): Message => {
        // 检查临时字段
        const pluginResponses = (message as any)._temp_plugin_responses;
        const moreContent = (message as any)._temp_more_content;
        
        if (pluginResponses && moreContent) {
            let newContent = message.content;
            const sortedResponses = [...pluginResponses].sort((a, b) => a.timestamp - b.timestamp);
            const sortedMoreContent = [...moreContent].sort((a, b) => a.timestamp - b.timestamp);
            
            // 组合内容和插件响应
            let currentIndex = 0;
            sortedResponses.forEach((response) => {
                while (currentIndex < sortedMoreContent.length && 
                       sortedMoreContent[currentIndex].timestamp <= response.timestamp) {
                    newContent += `\n${sortedMoreContent[currentIndex].content}`;
                    currentIndex++;
                }
                
                const pluginInfo = {
                    status: 'response',
                    plugin_id: parseInt(response.plugin_id),
                    plugin_name: response.plugin_name,
                    plugin_response: {
                        plugin_id: parseInt(response.plugin_id),
                        plugin_name: response.plugin_name,
                        data: response.data,
                        status: 'success'
                    }
                };
                newContent += `\n<plugin-data>${JSON.stringify(pluginInfo)}</plugin-data>\n`;
            });
            
            // 添加剩余的 more_content
            while (currentIndex < sortedMoreContent.length) {
                newContent += `\n${sortedMoreContent[currentIndex].content}`;
                currentIndex++;
            }
            
            // 创建新的消息对象，移除临时字段
            const { _temp_plugin_responses, _temp_more_content, ...cleanMessage } = message as any;
            return {
                ...cleanMessage,
                content: newContent
            };
        }
        
        // 如果没有临时字段，直接返回原消息
        return message;
    }
};

// 注册插件
dialogProcessor.registerPlugin(HistoryPluginHandler);

export default HistoryPluginHandler;