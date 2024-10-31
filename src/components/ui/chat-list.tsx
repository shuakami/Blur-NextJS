import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import React, { useState } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './chat_list.css';
import { CircleSlash } from "lucide-react";
import useTranslation from "@/hooks/useTranslation";
import BlurAnimatedWrapper from "@/components/Animations/blur_text";
import MoonLogo from "../../../pages/logo";
import { motion, AnimatePresence } from "framer-motion";
import Encode from "@/app/copyright/encode";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import EditButton from "@/components/ui/LLM/EditButton";
import EditableMessage from "@/components/ui/EditableMessage";

// 定义消息的类型
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
}

// 添加错误消息组件
const ErrorMessage = React.memo(({ content }: { content: string }) => (
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
            <div className="flex-shrink-0">
                <CircleSlash className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-red-600 dark:text-red-300 font-medium">
                    {content}
                </p>
            </div>
            <button className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 
                           dark:hover:text-red-300 transition-colors duration-200">
                获取帮助
            </button>
        </div>
    </motion.div>
));

ErrorMessage.displayName = 'ErrorMessage';

export const ChatList: React.FC<ChatListProps> = ({ isLoading, messages, onEditMessage }) => {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState<string | null>(null);

    const motionDivProps = {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.985 },
        transition: { duration: 0.15, ease: "easeOut" }
    };

    const handleEdit = async (id: string, newContent: string) => {
        if (onEditMessage) {
            await onEditMessage(id, newContent);
            setEditingId(null);
        }
    };

    return (
        <div className="p-4 space-y-8 h-full overflow-hidden">
            <div className="space-y-8">
                <TransitionGroup>
                    {messages.map((message, index) => {
                        const isBot = message.type === 'bot';
                        const isError = message.type === 'error';
                        const isLatestBotMessage = isBot && index === messages.length - 1;
                        const isEditing = message.id === editingId;

                        if (isError) {
                            return (
                                <CSSTransition key={index} timeout={500} classNames="message">
                                    <ErrorMessage content={message.content} />
                                </CSSTransition>
                            );
                        }

                        return (
                            <CSSTransition key={index} timeout={500} classNames="message">
                                <div className={`flex ${isBot ? 'items-start space-x-3' : 'justify-end items-start space-x-5'}`}>
                                    {isBot ? (
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
                                                            <MarkdownRenderer content={message.content} />
                                                        )}
                                                    </motion.div>
                                                </BlurAnimatedWrapper>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative group max-w-[70%]">
                                                {!isEditing && (
                                                    <div className="absolute left-[-50px] top-1 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <EditButton onClick={() => setEditingId(message.id!)} />
                                                    </div>
                                                )}
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={isEditing ? "edit" : "view"}
                                                        {...motionDivProps}
                                                    >
                                                    {!isEditing && (
                                                        <div className="absolute left-[-50px] top-1 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <EditButton onClick={() => setEditingId(message.id!)} />
                                                            </div>
                                                        )}
                                                        {!isEditing ? (
                                                            <div className="message-user rounded-3xl">
                                                                <p className="px-5 py-3 text-sm-md">{message.content}</p>
                                                            </div>
                                                        ) : (
                                                            <EditableMessage
                                                                content={message.content}
                                                                onSave={(newContent) => handleEdit(message.id!, newContent)}
                                                                onCancel={() => setEditingId(null)}
                                                            />
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                            <Avatar className="w-10 h-10 ml-4">
                                                <AvatarImage src={message.avatarUrl || "https://github.com/shuakami.png"} />
                                                <AvatarFallback>ER</AvatarFallback>
                                            </Avatar>
                                        </>
                                    )}
                                </div>
                            </CSSTransition>
                        );
                    })}
                </TransitionGroup>
            </div>
        </div>
    );
};