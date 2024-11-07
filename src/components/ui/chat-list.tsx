import React, { memo, useCallback } from "react";
import './chat_list.css';
import ErrorMessage from "./chat-list/ErrorMessage";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { ChatListProps, Message, ThoughtProcess } from "@/types/stream";

// 消息项组件
const MessageItem = memo(({ 
    message, 
    index, 
    isLoading, 
    editingId,
    onEditStart,
    onEditComplete,
    onEditCancel,
    isLastMessage 
}: {
    message: Message;
    index: number;
    isLoading?: boolean;
    editingId: string | null;
    onEditStart: (id: string) => void;
    onEditComplete: (id: string, content: string) => Promise<void>;
    onEditCancel: () => void;
    isLastMessage: boolean;
    thought?: ThoughtProcess;
}) => {
    const isBot = message.type === 'bot';
    const isError = message.type === 'error';
    const isEditing = message.id === editingId;

    if (isError) {
        return <ErrorMessage content={message.content} />;
    }

    return (
        <div className="flex flex-col">
            {isBot ? (
                <div className={`flex py-3 first:pt-4 last:pb-4 items-start space-x-4`}>
                       <BotMessage
                        content={message.content}
                        isLoading={isLoading}
                        isLatestBotMessage={isLastMessage}
                        thought={message.thought}
                    />
                </div>
            ) : (
                <div className={`flex py-3 first:pt-4 last:pb-4 justify-end items-start space-x-4`}>
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
export const ChatList = memo(({ isLoading, messages, onEditMessage, demo }: ChatListProps) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);

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
        <div className="h-full overflow-hidden w-full">
          <div className="space-y-1">
                    {messages.map((message, index) => (
                            <MessageItem
                                message={message}
                                index={index}
                                isLoading={isLoading}
                                editingId={editingId}
                                onEditStart={handleEditStart}
                                onEditComplete={handleEdit}
                                onEditCancel={handleEditCancel}
                                isLastMessage={index === messages.length - 1}
                            />
                    ))}
            </div>
        </div>
    );
});

ChatList.displayName = 'ChatList';

// 导出优化
export default memo(ChatList);