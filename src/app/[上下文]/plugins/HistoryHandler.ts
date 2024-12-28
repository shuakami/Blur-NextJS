import { APIMessage, Message } from '@/types/stream';
import dialogProcessor from '../core/DialogProcessor';

interface RelatedTo {
    type: 'memory_query' | string;
    id: string;
}

interface MoreContent {
    index: number;
    timestamp: number;
    content: string;
    display_order: number | null;
    related_to: RelatedTo | null;
    related_call_instance_id: string | null;
}

interface BaseResponse {
    call_instance_id: string;
    display_order: number | null;
    timestamp: number;
    status: string;
    data: string;
}

interface AgentResponse extends BaseResponse {
    agent_id: string;
    agent_name: string;
}

interface PluginResponse extends BaseResponse {
    plugin_id: string;
    plugin_name: string;
}

interface ResponseWithType extends BaseResponse {
    type: 'agent' | 'plugin';
    agent_id?: string;
    agent_name?: string;
    plugin_id?: string;
    plugin_name?: string;
}

const HistoryHandler = {
    onUpdateMessage: (message: Message): Message => {
        const agentResponses = ((message as any)._temp_agent_responses || []) as AgentResponse[];
        const pluginResponses = ((message as any)._temp_plugin_responses || []) as PluginResponse[];
        const moreContent = ((message as any)._temp_more_content || []) as MoreContent[];
        
        if (!agentResponses.length && !pluginResponses.length && !moreContent.length) {
            return message;
        }

        let newContent = message.content;
        
        // 1. 收集所有响应和more_content
        const allResponses = [
            ...agentResponses.map((r: AgentResponse) => ({ type: 'agent' as const, ...r })),
            ...pluginResponses.map((r: PluginResponse) => ({ type: 'plugin' as const, ...r }))
        ].sort((a: ResponseWithType, b: ResponseWithType) => (a.display_order || 0) - (b.display_order || 0));

        // 2. 处理每个响应及其关联的more_content
        allResponses.forEach((response: ResponseWithType) => {
            // 添加响应
            if (response.type === 'agent') {
                const agentInfo = {
                    type: 'agent',
                    call_instance_id: response.call_instance_id,
                    agent_id: response.agent_id,
                    agent_name: response.agent_name,
                    data: response.data,
                    status: response.status,
                    timestamp: response.timestamp
                };
                newContent += `\n<agent-data>${JSON.stringify(agentInfo)}</agent-data>\n`;
            } else {
                const pluginInfo = {
                    status: 'response',
                    plugin_id: response.plugin_id ? parseInt(response.plugin_id) : null,
                    plugin_name: response.plugin_name || '',
                    plugin_response: {
                        plugin_id: response.plugin_id ? parseInt(response.plugin_id) : null,
                        plugin_name: response.plugin_name,
                        data: response.data,
                        status: 'success'
                    }
                };
                newContent += `\n<plugin-data>${JSON.stringify(pluginInfo)}</plugin-data>\n`;
            }

            // 添加关联的more_content
            const relatedContent = moreContent
                .filter((m: MoreContent) => m.related_to?.id === response.call_instance_id)
                .sort((a: MoreContent, b: MoreContent) => (a.display_order || 0) - (b.display_order || 0));
            
            relatedContent.forEach((content: MoreContent) => {
                newContent += `\n\n${content.content}`;
            });
        });

        // 3. 添加未关联的more_content和记忆查询结果
        const unrelatedContent = moreContent
            .filter((m: MoreContent) => !m.related_to || m.related_to.type === 'memory_query')
            .sort((a: MoreContent, b: MoreContent) => (a.display_order || 0) - (b.display_order || 0));
        
        unrelatedContent.forEach((content: MoreContent) => {
            if (content.related_to?.type === 'memory_query') {
                // 记忆查询结果直接添加到内容中
                newContent += `\n\n${content.content}`;
            } else {
                newContent += `\n\n${content.content}`;
            }
        });

        // 4. 构建返回消息
        const { _temp_agent_responses, _temp_plugin_responses, _temp_more_content, ...cleanMessage } = message as any;
        const result = {
            ...cleanMessage,
            content: newContent.trim()
        };

        // 5. 添加agent相关信息（如果有）
        if (agentResponses.length > 0) {
            const lastAgent = agentResponses[agentResponses.length - 1];
            Object.assign(result, {
                agent_response: lastAgent,
                agent_id: lastAgent.agent_id,
                agent_name: lastAgent.agent_name,
                agent_status: 'response'
            });
        }

        return result;
    }
};

export default HistoryHandler;