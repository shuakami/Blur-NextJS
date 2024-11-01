import React, { memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import dynamic from 'next/dynamic';
import { CircleSlash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import './chat_list.css';

// 懒加载
const BlurAnimatedWrapper = dynamic(() => import("@/components/Animations/blur_text"), {
    ssr: false
});
const MoonLogo = dynamic(() => import("../../../pages/logo"), {
    ssr: false
});
const Encode = dynamic(() => import("@/app/copyright/encode"), {
    ssr: false
});
const AnimatedShinyText = dynamic(() => import("@/components/ui/animated-shiny-text"), {
    ssr: false
});
const EditButton = dynamic(() => import("@/components/ui/LLM/EditButton"), {
    ssr: false
});
const EditableMessage = dynamic(() => import("@/components/ui/EditableMessage"), {
    ssr: false
});

// 类型
export interface Message {
    type: string;
    content: string;
    avatarUrl?: string;
    id?: string;
}

interface ChatListProps {
    messages: Message[];
    isLoading?: boolean;
    onEditMessage?: (id: string, newContent: string) => Promise<void>;
    demo?: boolean;
}

// 动画
const motionConfig = {
    initial: { opacity: 0, scale: 0.985 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.985 },
    transition: { duration: 0.15, ease: "easeOut" }
} as const;

// 错误消息
const ErrorMessage = memo(({ content }: { content: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-center w-full my-4"
    >
        <div className="flex items-center space-x-3 px-4 py-3 
                      bg-red-50/50 dark:bg-red-900/10
                      border border-red-100 dark:border-red-800/30
                      rounded-lg shadow-sm max-w-[600px] w-full
                      backdrop-blur-sm">
            <CircleSlash className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-300 font-medium flex-1 min-w-0">
                {content}
            </p>
        </div>
    </motion.div>
));

ErrorMessage.displayName = 'ErrorMessage';

// Bot 消息
const BotMessage = memo(({ content, isLoading, isLatestBotMessage }: {
    content: string;
    isLoading?: boolean;
    isLatestBotMessage: boolean;
}) => (
    <>
        <Encode />
        <Avatar className="w-10 h-10 py-1 px-1 mt-6 border border-black/15 dark:border-white/15">
            <MoonLogo className="w-full h-full" />
        </Avatar>
        <div className="p-4 max-w-[91%]">
            <BlurAnimatedWrapper>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {isLoading && isLatestBotMessage ? (
                        <AnimatedShinyText darkMode={false} className="text mt-4" />
                    ) : (
                        <MarkdownRenderer content={content} />
                    )}
                </motion.div>
            </BlurAnimatedWrapper>
        </div>
    </>
));

BotMessage.displayName = 'BotMessage';

// 用户消息
const UserMessage = memo(({ 
    message, 
    isEditing, 
    onEdit, 
    onSave, 
    onCancel 
}: {
    message: Message;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (content: string) => Promise<void>;
    onCancel: () => void;
}) => (
    <>
        <div className="relative group max-w-[70%]">
            {!isEditing && (
                <div className="absolute left-[-50px] top-1 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <EditButton onClick={onEdit} />
                </div>
            )}
            <AnimatePresence mode="wait">
                <motion.div key={isEditing ? "edit" : "view"} {...motionConfig}>
                    {isEditing ? (
                        <EditableMessage
                            content={message.content}
                            onSave={onSave}
                            onCancel={onCancel}
                        />
                    ) : (
                        <div className="message-user rounded-3xl">
                            <p className="px-5 py-3 text-sm-md">{message.content}</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
        <Avatar className="w-10 h-10 ml-4">
            <AvatarImage src={message.avatarUrl || 'default-avatar-url'} />
            <AvatarFallback>ER</AvatarFallback>
        </Avatar>
    </>
));

UserMessage.displayName = 'UserMessage';

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