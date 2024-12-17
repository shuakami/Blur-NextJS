// ChatList.tsx

import React, { memo, useCallback, useRef } from "react";
import { Message } from "@/types/stream";
import { useChatStateContext } from "@/app/[上下文]/ChatContext";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { useScrollBehavior } from "@/hooks/ui/useScrollBehavior";
import './chat_list.css';

// 消息项组件
const MessageItem = memo(({ 
    message,
    isLoading,
    editingId,
    onEditStart,
    onEditComplete,
    onEditCancel,
    isLastMessage
}: {
    message: Message;
    isLoading?: boolean;
    editingId: string | null;
    onEditStart: (id: string) => void;
    onEditComplete: (id: string, content: string) => Promise<void>;
    onEditCancel: () => void;
    isLastMessage: boolean;
}) => {
    const isBot = message.type === 'bot';
    const isEditing = message.id === editingId;

    return (
        <div className={`flex flex-col w-full ${isBot ? 'mb-6' : 'mb-6'}`}>
            {isBot ? (
                <div className="flex items-start w-full">
                    <BotMessage
                        content={message.content}
                        messageId={message.message_id}
                        isLoading={isLoading}
                        isLatestBotMessage={isLastMessage}
                        thought={message.thought}
                        error={message.error}
                    />
                </div>
            ) : (
                <div className="flex justify-end items-start pr-3 sm:pr-0">
                    <UserMessage
                        message={message}
                        isEditing={isEditing}
                        onEdit={() => onEditStart(message.id!)}
                        onSave={(newContent) => onEditComplete(message.id!, newContent)}
                        onCancel={onEditCancel}
                    />
                </div>
            )}
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

// 主组件
export const ChatList = memo(({ 
    isLoading, 
    messages, 
    onEditMessage 
}: {
    isLoading?: boolean;
    messages: Message[];
    onEditMessage?: (id: string, content: string) => Promise<void>;
}) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isStreaming } = useChatStateContext();

    // 处理滚动
    useScrollBehavior(messagesEndRef, messages, isStreaming || false);

    const handleEdit = useCallback(async (id: string, newContent: string) => {
        if (onEditMessage) {
            await onEditMessage(id, newContent);
        }
        setEditingId(null);
    }, [onEditMessage]);

    const handleEditStart = useCallback((id: string) => {
        setEditingId(id);
    }, []);

    const handleEditCancel = useCallback(() => {
        setEditingId(null);
    }, []);

    return (
        <div className="relative w-full">
            <div className="h-full w-full">
                <div className="space-y-2">
                    {messages.map((message, index) => {
                        const spacingClass = index > 0 && messages[index - 1]?.type !== message.type 
                            ? 'mt-8' 
                            : 'mt-4';

                        return (
                            <div key={message.message_id} className={spacingClass}>
                                <MessageItem
                                    message={message}
                                    isLoading={isLoading}
                                    editingId={editingId}
                                    onEditStart={handleEditStart}
                                    onEditComplete={handleEdit}
                                    onEditCancel={handleEditCancel}
                                    isLastMessage={index === messages.length - 1}
                                />
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </div>
        </div>
    );
});

ChatList.displayName = 'ChatList';

export default memo(ChatList);
