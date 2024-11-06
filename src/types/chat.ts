import { Message, MessageVersion } from '@/types/stream';

interface MessagePair {
    userMessage: Message;
    botMessage: Message | null;
}

export interface ChatContextProps {
    messages: Message[] | null;
    sendMessage: (message: string, conversationId?: string) => void;
    addMessage: (message: Message) => void;
    triggerConversationsReload: () => void;
    reloadConversationsCounter: number;
    newConversationId: string | null;
    resetNewConversationId: () => void;
    isLoading?: boolean;
    loadMoreMessages: () => void;
    isStreaming?: boolean;
    stopStreaming?: () => void;
    conversationId?: string | null;
    modifyMessage: (messageId: string, newContent: string) => void;
    getMessageVersions: (messageId: string) => MessageVersion | null;
    findBotReply: (messageId: string) => Message | null;
    getFilteredMessages: (showInactive?: boolean) => Message[];
    getCurrentMessagePair: (message: Message, messageId: string | undefined, versionIndex: number) => MessagePair;
} 