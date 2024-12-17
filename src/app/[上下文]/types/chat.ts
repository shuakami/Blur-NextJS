import { Message, MessageStatus } from '@/types/stream';

export interface MessageState {
    messages: Message[];
    sendMessage: (options: {
        message: string;
        model: string;
        conversationId?: string;
        files?: File[];
    }) => void;
    addMessage: (message: Message) => void;
    updateMessage: (messageId: string, updates: Partial<Message & { sendStatus?: MessageStatus }>) => void;
    clearMessages: () => void;
    clearFailedMessages: (userMessageId?: string, botMessageId?: string) => void;
    retryMessage: (messageId: string) => Promise<void>;
}

export interface ConversationState {
    conversationId: string | null;
    newConversationId: string | null;
    resetNewConversationId: () => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;
}

export interface ChatState {
    isLoading: boolean;
    isStreaming: boolean;
    hasMore: boolean;
    loadMoreMessages: () => void;
    stopStreaming?: () => void;
    resetChatState: () => void;
} 