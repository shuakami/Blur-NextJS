// src/types/stream.ts

// 基础消息接口
interface BaseMessage {
    message_id: string;
    content: string;
    timestamp: number;
    status: 'active' | 'inactive';
    parent_id: string | null;
    children_ids: string[];
    version: number;
    modified_count: number;
}

// API消息接口
export interface APIMessage extends BaseMessage {
    role: 'system' | 'user' | 'assistant';
    plugin_responses?: PluginResponse[];
    more_content?: MoreContent[];
    agent_responses?: AgentResponse[];
}

// UI消息接口
export interface UIMessage extends BaseMessage {
    type: 'user' | 'bot' | 'error' | 'thought';
    avatarUrl: string;
    isStreaming?: boolean;
}

// 对话接口
export interface Conversation {
    user_id: string;
    conversation_id: string;
    messages: APIMessage[];
    total_messages: number;
}

export interface StreamChunk {
    type: string;
    chunk_index: number;
    content: string;
    is_final_chunk: boolean;
    code?: number;
    message?: string;
    details?: string;
    metadata?: any;
    status?: 'error';
    error?: {
        code: number;
        message: string;
        details?: string;
    };
    agent_response?: AgentResponse;
    
    // 插件相关字段
    plugin_id?: number;
    plugin_name?: string;
    call_index?: number;
    plugin_response?: {
        call_instance_id: string;
        plugin_id: number;
        plugin_name: string;
        data: string;
        timestamp: number;
        add_context?: boolean;
        plugin_list?: boolean;
        display_order: number;
        related_to: {
            type: string;
            id: string;
        }
    };
}
export interface FinalInfo {
    isComplete?: boolean;
    total_tokens: number;
    generation_duration: number;
}

export interface SendMessageParams {
    user_input: string;
    conversation_id?: string;
    parent_message_id?: string;
    user_id: string;
    model?: string;
}

export interface SendMessageResponse {
    message_id?: string | null;
    conversation_id: string;
    model: string;
    status: string;
    stream: StreamChunk[];
    final_info: FinalInfo | null;
    error: string | null;
    chat_title?: string;
}

export type MessageStatus = 'pending' | 'sent' | 'failed' | 'retrying';

export interface Message {
    id?: string;
    message_id?: string;
    type: string;
    role?: 'system' | 'user' | 'assistant';
    content: string;
    avatarUrl?: string;
    timestamp?: number;
    isStreaming?: boolean;
    status?: 'active' | 'inactive';
    parentId?: string;
    childrenIds?: string[];
    parent_message_id?: string;
    streamBuffer?: string;
    version?: number;
    modified_count?: number;
    isEdited?: boolean;
    edit_version?: number;
    original_message_id?: string;
    thought?: ThoughtProcess;
    
    // 插件相关字段
    plugin_id?: number;
    plugin_name?: string;
    plugin_status?: 'calling' | 'response';
    call_index?: number;
    plugin_response?: {
        plugin_id: number;
        plugin_name: string;
        data: any;
        status: string;
    };

    // 临时字段
    _temp_plugin_responses?: PluginResponse[];
    _temp_more_content?: MoreContent[];
    _temp_agent_responses?: AgentResponse[];

    // 报错 （UseSendMessage）
    error?: {
        code: number;
        message: string;
    };

    // 添加消息发送状态相关字段
    sendStatus?: MessageStatus;
    retryCount?: number;

    // 新增 Agent 相关字段
    agent_id?: string;
    agent_name?: string;
    agent_status?: 'calling' | 'response';
    agent_response?: {
        call_instance_id: string;
        agent_id: string;
        agent_name: string;
        data: any;
        status: string;
        timestamp: number;
    };

    // 添加模型字段
    model?: string;
}

export interface ThoughtProcess {
    content?: string;
    isAnimating?: boolean;
    duration?: number;
}

export interface FetchHistoryResponse {
    user_id: string;
    conversation_id: string;
    messages: APIMessage[];
    total_count: number;
}

export interface FetchHistoryParams {
    user_id: string;
    conversation_id?: string;
    limit?: number;
    offset?: number;
}

export interface MessageTransformer {
    toUIMessage: (apiMessage: APIMessage) => UIMessage;
    toAPIMessage: (uiMessage: UIMessage) => Partial<APIMessage>;
}

// 消息版本接口
export interface MessageVersion {
    messages: {
        user: Message;
        bot: Message | null;
    }[];
    activeIndex: number;
}

// 聊天列表组件的属性接口
export interface ChatListProps {
    isLoading?: boolean;
    messages: Message[];
    demo?: boolean;
    onEditMessage?: (id: string, newContent: string) => Promise<void>;
}

export interface PluginResponse {
    call_instance_id: string;
    plugin_id: string;
    plugin_name: string;
    data: any;
    timestamp: number;
}

export interface MoreContent {
    index: number;
    timestamp: number;
    content: string;
    related_call_instance_id: string;
}

// 状态的消息类型
export interface MessageWithStatus extends Message {
    sendStatus: MessageStatus;
    retryCount: number;
}

// Agent 相关的接口
export interface AgentResponse {
    call_instance_id: string;
    agent_id: string;
    agent_name: string;
    data: any;
    timestamp: number;
    status: string;
}