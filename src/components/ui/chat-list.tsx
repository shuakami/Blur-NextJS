// ChatList.tsx

import React, { memo, useCallback } from "react";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { ChatListProps, Message, ThoughtProcess } from "@/types/stream";
import './chat_list.css';
import ErrorMessage from "./chat-list/ErrorMessage"; // 直接导入，不使用懒加载

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
        <div className="flex flex-col w-full mt-14">
            {isBot ? (
                <div className={`flex py-2 first:pt-3 last:pb-3 items-start w-full`}>
                    <BotMessage
                        content={message.content}
                        isLoading={isLoading}
                        isLatestBotMessage={isLastMessage}
                        thought={message.thought}
                    />
                </div>
            ) : (
                <div className={`flex py-2 first:pt-3 last:pb-3 justify-end items-start pr-3 sm:pr-0 -mt-5`}>
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

    // 打印messages
    console.log('ChatList messages:', messages);

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
        <div className="relative w-full">
            <div className="h-full overflow-hidden w-full">
                <div className="space-y-0.5">
                    {messages.map((message, index) => (
                        <MessageItem
                            key={message.message_id} 
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
        </div>
    );
});

ChatList.displayName = 'ChatList';

// 导出优化
export default memo(ChatList);
