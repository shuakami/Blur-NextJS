// src/app/[拉取历史]/fetch_history.tsx

import apiClient from '@/lib/api/config';
import {FetchHistoryParams, FetchHistoryResponse, APIMessage} from '@/types/stream';
import {getTranslate} from '@/hooks/i18n/useTranslation';

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
};

// 截断文本
const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// 构建消息树的函数
export const buildMessageTree = (messages: APIMessage[]) => {
    // 创建消息映射
    const messageMap = new Map<string, APIMessage>();
    messages.forEach(msg => messageMap.set(msg.message_id, msg));

    // 找到根消息
    const rootMessages = messages.filter(msg => !msg.parent_id);

    // 递归构建树形结构的ASCII表示
    const buildTreeString = (message: APIMessage, level: number = 0, isLast: boolean = true): string => {
        const prefix = level === 0 ? '' : isLast ? '└── ' : '├── ';
        const indent = level === 0 ? '' : isLast ? '    ' : '│   ';
        
        // 构建消息头部信息
        const statusMark = message.status === 'active' ? '✓' : '✗';
        const roleMark = message.role === 'user' ? '👤' : '🤖';
        const time = formatTimestamp(message.timestamp);
        const version = message.version ? `v${message.version}` : '';
        const modifiedMark = (message.modified_count || 0) > 0 ? `(修改${message.modified_count}次)` : '';
        
        // 构建两行显示
        let result = `${' '.repeat(level * 4)}${prefix}[${message.message_id.slice(0, 8)}] ${roleMark} ${statusMark} ${time} ${version} ${modifiedMark}\n`;
        result += `${' '.repeat(level * 4)}${indent}内容: ${truncateText(message.content)}\n`;

        // 处理子消息
        if (message.children_ids && message.children_ids.length > 0) {
            message.children_ids.forEach((childId, index) => {
                const child = messageMap.get(childId);
                if (child) {
                    const isLastChild = index === message.children_ids!.length - 1;
                    result += buildTreeString(child, level + 1, isLastChild);
                }
            });
        }

        return result;
    };

    // 构建并打印树
    let treeString = '消息树结构:\n';
    treeString += '==========================================\n';
    rootMessages.forEach((root, index) => {
        treeString += buildTreeString(root, 0, index === rootMessages.length - 1);
        if (index < rootMessages.length - 1) {
            treeString += '------------------------------------------\n';
        }
    });
    treeString += '==========================================\n';

    // 打印统计信息
    const stats = {
        total: messages.length,
        active: messages.filter(m => m.status === 'active').length,
        modified: messages.filter(m => (m.modified_count || 0) > 0).length,
        user: messages.filter(m => m.role === 'user').length,
        assistant: messages.filter(m => m.role === 'assistant').length,
    };

    console.log(treeString);
    console.log('统计信息:', stats);

    return { treeString, stats };
};

/**
 * 拉取历史记录的函数
 * @param params - 请求参数，包括 user_id、conversation_id、limit 和 offset
 * @returns 返回拉取的历史记录
 * @throws 如果请求失败，则抛出错误
 */
export const fetchHistory = async (params: FetchHistoryParams): Promise<FetchHistoryResponse> => {
    const t = getTranslate();
    const requestBody: Record<string, any> = {
        user_id: params.user_id,
        limit: params.limit || 20,
        offset: params.offset || 0,
    };

    // 如果传入了 conversation_id，则添加到请求体中
    if (params.conversation_id) {
        requestBody.conversation_id = params.conversation_id;
    }

    try {
        // 发送 POST 请求
        const response = await apiClient.post<FetchHistoryResponse>('/api/v1/history', requestBody);
        
        // 构建并打印消息树
        buildMessageTree(response.data.messages);
        
        return response.data;
    } catch (error) {
        throw new Error(t('拉取历史记录失败'));
    }
};
