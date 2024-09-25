// src/types/stream.ts

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
    total_tokens: number;
    generation_duration: number;
}

export interface SendMessageParams {
    user_input: string;
    user_id?: string;
    conversation_id?: string;
}

export interface SendMessageResponse {
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
    type: string;
    content: string;
    avatarUrl: string;
    isStreaming?: boolean;
}

////////////////////////////////////////

export interface Conversation {
    conversation_id: string;
    chat_title: string | null;
    timestamp: number;  // 秒级时间戳
}

export interface APIMessage {
    message_id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number; // 秒级时间戳
    branch: string | null;
    keys_used_count: number;
}

export interface FetchHistoryResponse {
    user_id: string;
    conversation_id: string;
    messages: APIMessage[];
}

export interface FetchHistoryParams {
    user_id: string;
    conversation_id?: string;
    limit?: number;
    offset?: number;
}


export interface UIMessage {
    avatarUrl: string;
    content: string;
    id: string;
    timestamp: number;
    type: 'user' | 'bot';
}