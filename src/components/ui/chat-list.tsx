import React, { memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { CircleSlash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import './chat_list.css';
import ErrorMessage from "./chat-list/ErrorMessage";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { ChatListProps, Message } from "@/types/stream";






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
}) => {
    const isBot = message.type === 'bot';
    const isError = message.type === 'error';
    const isEditing = message.id === editingId;

    if (isError) {
        return <ErrorMessage content={message.content} />;
    }

    return (
        <div className={`flex ${isBot ? 'items-start space-x-3' : 'justify-end items-start space-x-5'}`}>
            {isBot ? (
                <BotMessage
                    content={message.content}
                    isLoading={isLoading}
                    isLatestBotMessage={isLastMessage}
                />
            ) : (
                <UserMessage
                    message={message}
                    isEditing={isEditing}
                    onEdit={() => onEditStart(message.id!)}
                    onSave={(newContent) => onEditComplete(message.id!, newContent)}
                    onCancel={onEditCancel}
                />
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
        <div className="p-4 space-y-8 h-full overflow-hidden">
            <div className="space-y-8">
                <TransitionGroup>
                    {messages.map((message, index) => (
                        <CSSTransition key={message.id || index} timeout={500} classNames="message">
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
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </div>
        </div>
    );
});

ChatList.displayName = 'ChatList';

// 导出优化
export default memo(ChatList);