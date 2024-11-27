// ChatList.tsx

import React, { memo, useCallback, useRef, useEffect } from "react";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import { ChatListProps, Message, ThoughtProcess } from "@/types/stream";
import './chat_list.css';
import { usePathname } from 'next/navigation';
import { useChatContext } from "@/app/[上下文]/ChatContext";


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
export const ChatList = memo(({ isLoading, messages, onEditMessage, demo }: ChatListProps) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const lastPathRef = useRef(pathname);
    const { isStreaming } = useChatContext();
    const userInteractedRef = useRef(false);
    const lastScrollTime = useRef(0);

    useEffect(() => {
        if (messages.length === 0) return;
        
        const scrollContainer = document.querySelector('.flex-1.overflow-auto.w-full.pt-12');
        if (!scrollContainer) return;

        const isPathChanged = lastPathRef.current !== pathname;
        lastPathRef.current = pathname;

        // 使用防抖处理滚动事件
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime.current < 50) return; // 50ms 节流
            lastScrollTime.current = now;

            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
            
            if (isAtBottom) {
                userInteractedRef.current = false;
            }
        };

        // 简化用户交互处理
        const handleUserInteraction = (e: Event) => {
            if (!e.isTrusted) return;
            userInteractedRef.current = true;
        };

        // 使用事件委托减少事件监听器数量
        const handleInteractions = (e: Event) => {
            if (e.type === 'scroll') {
                handleScroll();
            } else {
                handleUserInteraction(e);
            }
        };

        scrollContainer.addEventListener('scroll', handleInteractions, { passive: true });
        scrollContainer.addEventListener('wheel', handleInteractions, { passive: true });
        scrollContainer.addEventListener('touchstart', handleInteractions, { passive: true });

        // 只在必要时滚动
        if (isPathChanged || !userInteractedRef.current || (isStreaming && !userInteractedRef.current)) {
            requestAnimationFrame(() => {
                if (isPathChanged) {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                } else {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        return () => {
            scrollContainer.removeEventListener('scroll', handleInteractions);
            scrollContainer.removeEventListener('wheel', handleInteractions);
            scrollContainer.removeEventListener('touchstart', handleInteractions);
        };
    }, [messages, pathname, isStreaming]);

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
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                        
                        // 计算额外的间距类名
                        const spacingClass = (() => {
                            if (!prevMessage) return ''; // 第一条消息
                            if (prevMessage.type !== message.type) return 'mt-8'; // 不同类型消息之间
                            return 'mt-4'; // 相同类型消息之间
                        })();

                        return (
                            <div key={message.message_id} className={spacingClass}>
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

// 导出优化
export default memo(ChatList);
