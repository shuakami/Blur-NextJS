import { APIMessage, Message } from '@/types/stream';

// 消息相关配置
export const MESSAGE_CONFIG = {
    AVATARS: {
        BOT: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
        USER_DEFAULT: 'https://github.com/shuakami.png'
    }
} as const;

// 消息格式化选项接口
export interface MessageFormatOptions {
    userImageUrl?: string;
    botImageUrl?: string;
}

/**
 * 将API消息格式转换为前端展示格式
 * @param apiMessages - 后端返回的消息数组
 * @param options - 格式化选项
 * @returns 格式化后的消息数组
 */
export const formatMessages = (
    apiMessages: APIMessage[], 
    options: MessageFormatOptions = {}
): Message[] => {
    const {
        userImageUrl = MESSAGE_CONFIG.AVATARS.USER_DEFAULT,
        botImageUrl = MESSAGE_CONFIG.AVATARS.BOT
    } = options;

    return apiMessages.map((msg: APIMessage): Message => {
        // 构建基础消息结构
        const baseMessage = {
            // 消息标识
            message_id: msg.message_id,        // 消息唯一ID
            content: msg.content,              // 消息内容
            timestamp: msg.timestamp,          // 消息时间戳
            status: msg.status,                // 消息状态
            files: msg.files,

            // 消息树结构
            parent_id: msg.parent_id,          // 父消息ID
            children_ids: msg.children_ids,     // 子消息ID数组
            
            // 版本控制
            version: msg.version,              // 消息版本号
            modified_count: msg.modified_count, // 消息修改次数
            
            // 展示相关
            type: msg.role === 'assistant' ? 'bot' : 'user',  // 消息类型
            avatarUrl: msg.role === 'assistant' ? botImageUrl : userImageUrl, // 头像URL
            isStreaming: false,                // 是否正在流式传输
        } as Message;

        // 用户消息直接返回基础结构
        if (msg.role === 'user') {
            return baseMessage;
        }

        // Bot消息需要额外处理插件和Agent相关数据
        if (msg.role === 'assistant') {
            return {
                ...baseMessage,
                _temp_plugin_responses: msg.plugin_responses || [], // 插件响应数据（临时）
                _temp_more_content: msg.more_content || [],        // 附加内容（临时）
                _temp_agent_responses: msg.agent_responses || []   // Agent响应数据（临时）
            };
        }

        return baseMessage;
    });
};

// 消息创建选项接口
export interface CreateMessageOptions {
    userImageUrl?: string;
    botImageUrl?: string;
}

/**
 * 消息创建工具函数集合
 */
export const createMessage = {
    /**
     * 创建用户消息
     * @param content - 消息内容
     * @param options - 创建选项
     */
    user: (content: string, options: CreateMessageOptions = {}): Message => ({
        message_id: `msg_${Date.now()}`,
        type: 'user',
        content,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'active',
        avatarUrl: options.userImageUrl || MESSAGE_CONFIG.AVATARS.USER_DEFAULT,
    }),

    /**
     * 创建机器人消息
     * @param content - 消息内容
     * @param isStreaming - 是否正在流式传输
     * @param options - 创建选项
     */
    bot: (content: string = '', isStreaming: boolean = true, options: CreateMessageOptions = {}): Message => ({
        message_id: `msg_${Date.now()}`,
        type: 'bot',
        content,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'active',
        avatarUrl: options.botImageUrl || MESSAGE_CONFIG.AVATARS.BOT,
        isStreaming,
    }),

    /**
     * 创建错误消息
     * @param content - 错误内容
     */
    error: (content: string): Message => ({
        message_id: `msg_${Date.now()}`,
        type: 'error',
        content,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'active',
        avatarUrl: '',
    })
}; 