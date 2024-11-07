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
    metadata: {
        timestamp: number;
    };
}

export interface FinalInfo {
    isComplete?: boolean;
    total_tokens: number;
    generation_duration: number;
}

export interface SendMessageParams {
    user_input: string;
    user_id: string;
    conversation_id?: string;
    parent_message_id?: string;
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
}