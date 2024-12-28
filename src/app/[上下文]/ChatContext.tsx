import React, { useMemo } from 'react';
import useChat from './hooks/useChat';
import { MessageProvider } from './contexts/MessageContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { ChatStateProvider } from './contexts/ChatStateContext';
import { MessageState } from './types/chat';

const MemoizedMessageProvider = React.memo(MessageProvider);
const MemoizedConversationProvider = React.memo(ConversationProvider);
const MemoizedChatStateProvider = React.memo(ChatStateProvider);

export const ChatProvider: React.FC<{
    children: React.ReactNode;
    initialConversationId?: string;
}> = ({ children, initialConversationId }) => {
    const chat = useChat(initialConversationId);

    const memoizedMessageMethods = useMemo<Omit<MessageState, 'messages'>>(() => ({
        addMessage: chat.addMessage,
        updateMessage: chat.updateMessage,
        clearMessages: chat.clearMessages,
        clearFailedMessages: chat.clearFailedMessages,
        sendMessage: chat.sendMessage,
        retryMessage: chat.retryMessage
    }), [
        chat.addMessage,
        chat.updateMessage,
        chat.clearMessages,
        chat.clearFailedMessages,
        chat.sendMessage,
        chat.retryMessage
    ]);

    const messageState = useMemo<Pick<MessageState, 'messages'>>(() => ({
        messages: chat.messages
    }), [chat.messages]);

    const messageValue = useMemo<MessageState>(() => ({
        ...messageState,
        ...memoizedMessageMethods
    }), [messageState, memoizedMessageMethods]);

    const memoizedConversationMethods = useMemo(() => ({
        resetNewConversationId: chat.resetNewConversationId,
        triggerConversationsReload: chat.triggerConversationsReload
    }), [chat.resetNewConversationId, chat.triggerConversationsReload]);

    const conversationState = useMemo(() => ({
        conversationId: chat.conversationId,
        newConversationId: chat.newConversationId,
        reloadConversationsCounter: chat.reloadConversationsCounter
    }), [
        chat.conversationId,
        chat.newConversationId,
        chat.reloadConversationsCounter
    ]);

    const conversationValue = useMemo(() => ({
        ...conversationState,
        ...memoizedConversationMethods
    }), [conversationState, memoizedConversationMethods]);

    const memoizedChatStateMethods = useMemo(() => ({
        loadMoreMessages: chat.loadMoreMessages,
        stopStreaming: chat.stopStreaming,
        resetChatState: chat.resetChatState
    }), [chat.loadMoreMessages, chat.stopStreaming, chat.resetChatState]);

    const chatState = useMemo(() => ({
        isLoading: chat.isLoading,
        isStreaming: chat.isStreaming,
        hasMore: chat.hasMore
    }), [chat.isLoading, chat.isStreaming, chat.hasMore]);

    const chatStateValue = useMemo(() => ({
        ...chatState,
        ...memoizedChatStateMethods
    }), [chatState, memoizedChatStateMethods]);

    return (
        <MemoizedConversationProvider value={conversationValue}>
            <MemoizedMessageProvider value={messageValue}>
                <MemoizedChatStateProvider value={chatStateValue}>
                    {children}
                </MemoizedChatStateProvider>
            </MemoizedMessageProvider>
        </MemoizedConversationProvider>
    );
};

export {
    useMessageContext,
    useConversationContext,
    useChatStateContext,
} from './contexts/index';