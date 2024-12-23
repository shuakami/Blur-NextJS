// ChatList.tsx

import React, { memo, useCallback, useRef, Suspense } from "react";
import { Message } from "@/types/stream";
import { useChatStateContext } from "@/app/[上下文]/ChatContext";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import './chat_list.css';
import { useRouter } from 'next/router';

// 节流函数
const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

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
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        requestAnimationFrame(() => {
            setIsReady(true);
        });
    }, []);

    if (!isReady) return null;

    return (
        <div className={`message-item message-item-enter message-optimize flex flex-col w-full ${isBot ? 'mb-6' : 'mb-6'}`}>
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
    const router = useRouter();

    // 在页面加载/路由变化时，自动滚动到最底部
    React.useEffect(() => {
        const scrollContainer = document.querySelector('.scroll-container');
        if (!scrollContainer) return;
        
        let rafId: number;
        let timeoutId: number;
        let isInitialLoad = true;

        // 2秒后关闭初始加载状态
        setTimeout(() => {
            isInitialLoad = false;
        }, 2000);

        const forceScroll = () => {
            const execute = () => {
                if (scrollContainer) {
                    try {
                        (scrollContainer as HTMLElement).style.scrollBehavior = 'auto';
                        (scrollContainer as HTMLElement).scrollTop = (scrollContainer as HTMLElement).scrollHeight;
                        rafId = requestAnimationFrame(() => {
                            (scrollContainer as HTMLElement).style.scrollBehavior = 'smooth';
                        });
                    } catch (e) {
                        console.warn('Scroll failed, retrying...', e);
                    }
                }
            };

            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            timeoutId = window.setTimeout(execute, 100);
        };

        const throttledScroll = throttle(forceScroll, 150);

        const observer = new MutationObserver((mutations) => {
            if (isInitialLoad || mutations.some(mutation => {
                return Array.from(mutation.addedNodes).some(node => {
                    if (node instanceof HTMLElement) {
                        return node.classList.contains('message-item') ||
                               node.querySelector('.message-item');
                    }
                    return false;
                });
            })) {
                throttledScroll();
            }
        });

        observer.observe(scrollContainer, {
            childList: true,
            subtree: true,
            characterData: false,
            attributes: false
        });
        
        const handleRoute = () => {
            isInitialLoad = true;
            // 路由变化时也重置2秒计时
            setTimeout(() => {
                isInitialLoad = false;
            }, 2000);
            throttledScroll();
        };

        router.events.on('routeChangeStart', handleRoute);
        router.events.on('routeChangeComplete', handleRoute);
        router.events.on('hashChangeComplete', handleRoute);
        
        throttledScroll();
        
        return () => {
            observer.disconnect();
            router.events.off('routeChangeStart', handleRoute);
            router.events.off('routeChangeComplete', handleRoute);
            router.events.off('hashChangeComplete', handleRoute);
            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            isInitialLoad = false;  // 确保清理
        };
    }, [router.asPath]);

    // 编辑消息
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
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
});

ChatList.displayName = 'ChatList';

export default memo(ChatList);
