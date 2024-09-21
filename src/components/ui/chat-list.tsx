import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import React from "react";

// 定义消息的类型
interface Message {
    type: string; // 建议为bot|user
    content: string;
    avatarUrl?: string;
}

// 定义 ChatList 组件的Props类型
interface ChatListProps {
    messages: Message[];
}

// ChatList 组件
export const ChatList: React.FC<ChatListProps> = ({ messages }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 mt-20 space-y-5">
            {messages.map((message, index) => {
                // 判断消息类型
                const isBot = message.type === 'bot';

                return (
                    <div
                        key={index}
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
                                <div className="p-4 -p -mt-3 rounded-lg max-w-[85%]">
                                    <MarkdownRenderer content={message.content}/>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* 人类消息 */}
                                <div className="message-user rounded-3xl px-5 py-3.5 pt-[0.6em] -mt-2 max-w-[70%]">
                                    <p className="text-sm-md">{message.content}</p>
                                </div>
                                {/* 人类头像 */}
                                <Avatar className="w-10 h-10 ml-4">
                                    <AvatarImage src={message.avatarUrl || "https://github.com/shuakami.png"}/>
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};