import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import React from "react";
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import AutoScrollToBottom from "@/components/ui/AutoScrollToBottom"; // 导入自动滚动组件
import './chat_list.css'; // 导入动画的CSS

// 定义消息的类型
export interface Message {
    type: string; // 'bot' | 'user'
    content: string;
    avatarUrl?: string;
}

// 定义 ChatList 组件的 Props 类型
interface ChatListProps {
    messages: Message[];
}

// ChatList 组件
export const ChatList: React.FC<ChatListProps> = ({messages}) => {
    return (
        <AutoScrollToBottom trigger={messages}> {/* 包装 AutoScrollToBottom */}
            <div className="p-4 mt-10 space-y-8 h-full">
                <div className="md:max-w-3xl xl:max-w-[970px] 2xl:ml-10 space-y-8">
                    <TransitionGroup>
                        {messages.map((message, index) => {
                            const isBot = message.type === 'bot';
                            return (
                                <CSSTransition key={index} timeout={500} classNames="message">
                                    <div
                                        className={`flex ${isBot ? 'items-start space-x-3' : 'justify-end items-start space-x-4'}`}
                                    >
                                        {isBot ? (
                                            <>
                                                {/* 机器人头像 */}
                                                <Avatar className="w-10 h-10 py-1 px-1 mt-3.5">
                                                    <AvatarImage
                                                        src={message.avatarUrl || "https://api.dicebear.com/6.x/bottts/svg?seed=Felix"}/>
                                                </Avatar>
                                                {/* 机器人消息使用 MarkdownRenderer 渲染 */}
                                                <div className="p-4 max-w-[85%]">
                                                    <MarkdownRenderer content={message.content}/>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* 人类消息 */}
                                                <div
                                                    className="message-user rounded-3xl px-5 py-3.5 pt-[0.6em] max-w-[70%]">
                                                    <p className="text-sm-md">{message.content}</p>
                                                </div>
                                                {/* 人类头像 */}
                                                <Avatar className="w-10 h-10 ml-4">
                                                    <AvatarImage
                                                        src={message.avatarUrl || "https://github.com/shuakami.png"}/>
                                                    <AvatarFallback>CN</AvatarFallback>
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
        </AutoScrollToBottom>
    );
};
