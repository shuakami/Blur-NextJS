// ChatList.tsx

import React, { memo, useCallback, useEffect, useRef, Suspense } from "react";
import { Message } from "@/types/stream";
import { useChatStateContext, useConversationContext, useMessageContext } from "@/app/[上下文]/ChatContext";
import { useAuth } from '@clerk/nextjs';
import { messageTreeProcessor } from "@/app/[消息显示]/MessageTreeProcessor";
import BotMessage from "./BotMessage";
import UserMessage from "./UserMessage";
import MessagePagination from "./MessagePagination";
import './chat_list.css';

// 错误边界组件
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <div className="text-red-500">加载组件失败</div>;
        }

        return this.props.children;
    }
}

// 节流函数
const throttle = <T extends (...args: any[]) => void>(func: T, limit: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// 将APIMessage转换为Message的辅助函数
const convertToMessage = (apiMessage: any): Message => {
    // 保持role信息
    const converted = {
        ...apiMessage,
        type: apiMessage.role === 'assistant' ? 'bot' : 'user',
        role: apiMessage.role // 保留原始role
    };
    console.log(`转换消息: ${apiMessage.message_id}`);
    console.log(`- 原始role: ${apiMessage.role}`);
    console.log(`- 转换后type: ${converted.type}`);
    return converted;
};

// 消息项组件
const MessageItem = memo(({ 
    message,
    isLoading,
    editingId,
    onEditStart,
    onEditComplete,
    onEditCancel,
    isLastMessage,
    currentPage,
    onPageChange
}: {
    message: Message;
    isLoading?: boolean;
    editingId: string | null;
    onEditStart: (id: string) => void;
    onEditComplete: (id: string, content: string) => Promise<void>;
    onEditCancel: () => void;
    isLastMessage: boolean;
    currentPage: number;
    onPageChange: (page: number) => void;
}) => {
    const isBot = message.type === 'bot';
    const isEditing = message.message_id === editingId;
    const [isReady, setIsReady] = React.useState(false);
    const { getToken, userId } = useAuth();
    const { conversationId } = useConversationContext();
    const [token, setToken] = React.useState<string>('');

    // 检查是否需要显示分页器
    const shouldShowPaginator = React.useMemo(() => {
        const should = !isBot && messageTreeProcessor.shouldShowPagination(message.message_id!);
        console.log(`检查是否显示分页器 - 消息ID: ${message.message_id}`);
        console.log(`- 消息类型: ${message.type}`);
        console.log(`- 是否显示: ${should}`);
        return should;
    }, [isBot, message.message_id, message.type]);
    
    // 获取分页信息
    const paginationInfo = React.useMemo(() => {
        if (!shouldShowPaginator) {
            console.log(`不需要分页信息 - 消息ID: ${message.message_id}`);
            return null;
        }
        console.log(`获取分页信息 - 消息ID: ${message.message_id}`);
        console.log(`- 消息类型: ${message.type}`);
        console.log(`- 当前页: ${currentPage}`);
        const info = messageTreeProcessor.getPaginationInfo(currentPage);
        console.log(`- 获取到分页信息:`, info);
        return info;
    }, [shouldShowPaginator, currentPage, message.message_id, message.type]);

    // 获取token
    React.useEffect(() => {
        const fetchToken = async () => {
            const token = await getToken();
            setToken(token || '');
        };
        fetchToken();
    }, [getToken]);

    React.useEffect(() => {
        requestAnimationFrame(() => {
            setIsReady(true);
        });
    }, []);

    if (!isReady || !token || !userId || !conversationId) return null;

    return (
        <div className="w-full">
            <div className={`message-item message-item-enter message-optimize flex flex-col w-full ${isBot ? 'mb-6' : 'mb-6'}`}>
                {isBot ? (
                    <div className="flex flex-col items-start w-full">
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
                        <ErrorBoundary>
                            <Suspense fallback={<div className="text-gray-400">加载中...</div>}>
                                <UserMessage
                                    message={message}
                                    isEditing={isEditing}
                                    userId={userId}
                                    conversationId={conversationId}
                                    token={token}
                                    onEdit={() => onEditStart(message.message_id!)}
                                    onSave={(newContent) => onEditComplete(message.message_id!, newContent)}
                                    onCancel={onEditCancel}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                )}
            </div>
            {/* 分页器独立显示 */}
            {shouldShowPaginator && paginationInfo && (
                <div className="w-full flex justify-center mt-4">
                    <MessagePagination
                        currentPage={paginationInfo.currentPage}
                        totalPages={paginationInfo.totalPages}
                        onPageChange={onPageChange}
                        pageMessages={paginationInfo.pageMessages}
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
    const { isStreaming: _isStreaming } = useChatStateContext();
    
    // 分页相关状态
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [displayMessages, setDisplayMessages] = React.useState<Message[]>(messages);

    // 初始化消息树和分页
    useEffect(() => {
        console.log("初始化消息树和分页...");
        if (!messages || messages.length === 0) {
            console.log("没有消息可显示");
            setDisplayMessages([]);
            return;
        }

        // 构建完整的消息树
        messageTreeProcessor.buildTree(messages);
        
        // 获取当前页的所有消息并转换类型
        const result = messageTreeProcessor.getPagedMessages({
            currentPage: 1
        });
        
        setCurrentPage(1);
        setTotalPages(result.totalPages);
        setDisplayMessages(result.messages.map(convertToMessage));
        
        console.log(`初始化完成: 总页数=${result.totalPages}, 当前页=1, 当前页消息数=${result.messages.length}`);
    }, [messages]); 

    // 处理页面切换
    const handlePageChange = useCallback((page: number) => {
        if (!messages || messages.length === 0) return;
        
        console.log(`\n========== 切换到页面 ${page} ==========`);
        console.log("重建消息树...");
        messageTreeProcessor.buildTree(messages);
        
        const result = messageTreeProcessor.getPagedMessages({
            currentPage: page
        });
        
        console.log("转换消息...");
        const convertedMessages = result.messages.map(msg => {
            const converted = convertToMessage(msg);
            console.log(`- 消息 ${msg.message_id}: ${msg.role} -> ${converted.type}`);
            return converted;
        });
        
        setCurrentPage(page);
        setDisplayMessages(convertedMessages);
        console.log(`页面切换完成: 获取到${convertedMessages.length}条消息`);
        console.log("========== 页面切换完成 ==========\n");
    }, [messages]);

    // 开发环境下输出调试信息
    if (process.env.NODE_ENV === 'development') {
        console.log("消息树调试信息:");
        messageTreeProcessor.buildTree(messages);
        console.log("消息树结构:");
        console.log(messageTreeProcessor.generateTreeString());
        console.log("消息统计:", messageTreeProcessor.getStats());
    }

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
                    {displayMessages.map((message, index) => {
                        const spacingClass = index > 0 && displayMessages[index - 1]?.type !== message.type 
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
                                    isLastMessage={index === displayMessages.length - 1}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
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