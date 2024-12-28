// src/types/stream.ts

// 基础消息属性
interface IBaseMessageProps {
    message_id: string;
    content: string;
    timestamp: number;
    status: 'active' | 'inactive';
    parent_id?: string | null;
    children_ids?: string[];
    version?: number;
    modified_count?: number;
    files?: (SimpleUploadedFile | File | FileInfo)[];
}

// 基础消息接口
interface BaseMessage extends IBaseMessageProps {}

// 插件相关字段
interface IPluginFields {
    plugin_id?: number;
    plugin_name?: string;
    call_index?: number;
    plugin_status?: 'calling' | 'response';
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
        };
    };
}

// 错误相关字段
interface IErrorFields {
    error?: {
        code: number;
        message: string;
        details?: string;
    };
}

// Agent 相关字段
interface IAgentFields {
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
}

// API消息接口
export interface APIMessage extends BaseMessage, IPluginFields, IErrorFields {
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

// StreamChunk 接口
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
        };
    };
}

export interface FinalInfo {
    isComplete?: boolean;
    total_tokens: number;
    generation_duration: number;
    chat_title: string;
}

export interface SendMessageParams {
    user_input: string;
    user_id: string;
    conversation_id?: string;
    parent_message_id?: string;
    model?: string;
    files?: { file_id: string; filename: string; file_type: string }[];
}

export interface ImageData {
    base64_data: string;
    image_type: 'jpeg' | 'jpg' | 'png';
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

// 简化的上传文件类型
export interface SimpleUploadedFile {
    file_id: string;
    name: string;
    file_type: string;
    size?: number;
    url?: string;
}

// 文件信息接口
export interface FileInfo extends SimpleUploadedFile {
    created_at?: string;
}

// 文件上传信息接口
export interface FileUploadInfo {
    file: File;
    file_id: string;
    progress: number;
    isUploading: boolean;
    error?: string;
    file_info?: {
        name: string;
        type: string;
        size: number;
        url?: string;
    };
}

// 消息中的文件类型
export type MessageFile = File | FileInfo | FileUploadInfo;

// 消息接口
export interface Message extends BaseMessage, IPluginFields, IAgentFields {
    id?: string;
    type: string;
    role?: 'system' | 'user' | 'assistant';
    avatarUrl?: string;
    isStreaming?: boolean;
    parentId?: string;
    streamBuffer?: string;
    isEdited?: boolean;
    edit_version?: number;
    original_message_id?: string;
    thought?: ThoughtProcess;
    childrenIds?: string[];

    // 临时字段
    _temp_plugin_responses?: PluginResponse[];
    _temp_more_content?: MoreContent[];
    _temp_agent_responses?: AgentResponse[];

    // 报错 （UseSendMessage）
    error?: {
        code: number;
        message: string;
    };

    // 修改文件字段类型
    files?: (SimpleUploadedFile | File | FileInfo)[];

    // 添加消息发送状态相关字段
    sendStatus?: MessageStatus;
    retryCount?: number;

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
    display_order: number | null;
    related_to: {
        type: 'memory_query' | string;
        id: string;
    } | null;
    related_call_instance_id: string | null;
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
