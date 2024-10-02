import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import React from "react";
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import AutoScrollToBottom from "@/components/ui/AutoScrollToBottom";
import './chat_list.css';
import {CircleSlash} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";
import BlurAnimatedWrapper from "@/components/Animations/blur_text";
import MoonLogo from "../../../pages/logo";
import {motion} from "framer-motion"; // 使用 framer-motion

import Encode from "@/app/copyright/encode";
import AnimatedShinyText from "@/components/ui/animated-shiny-text"; // 导入动画组件
import {useChatContext} from '@/app/[上下文]/ChatContext'; // 获取 isLoading 状态

// 定义消息的类型
export interface Message {
    type: string; // 'bot' | 'user' | 'error' | 'loading'
    content: string;
    avatarUrl?: string;
}

// 定义 ChatList 组件的 Props 类型
interface ChatListProps {
    messages: Message[];
}

// ChatList 组件
export const ChatList: React.FC<ChatListProps> = ({messages}) => {
    const {t} = useTranslation();
    const {isLoading} = useChatContext(); // 从 ChatContext 获取 isLoading 状态

    return (
        <AutoScrollToBottom trigger={messages}>
            <div className="p-4 space-y-8 h-full overflow-hidden">
                <div className="md:max-w-3xl xl:max-w-[970px] space-y-8">
                    <TransitionGroup>
                        {messages.map((message, index) => {
                            const isBot = message.type === 'bot';
                            const isError = message.type === 'error';
                            const isLatestBotMessage = isBot && index === messages.length - 1; // 判断是否是最新的机器人消息

                            if (isError) {
                                return (
                                    <CSSTransition key={index} timeout={500} classNames="message">
                                        <div
                                            className="py-5 px-8 mb-3 max-w-[85%] my-2 flex items-center rounded-full border border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                                            <CircleSlash className="w-5 h-5 mr-2 text-red-700 dark:text-red-400"/>
                                            <span
                                                className="text-sm text-red-700 dark:text-red-200">{message.content}&nbsp;</span>
                                            <span
                                                className="text-sm hover:text-red-200/70 ease-in-out duration-300 text-transparent">
                                                {t('无法解决？生成技术支持工单')}
                                            </span>
                                        </div>
                                    </CSSTransition>
                                );
                            }

                            return (
                                <CSSTransition key={index} timeout={500} classNames="message">
                                    <div
                                        className={`flex ${isBot ? 'items-start space-x-3' : 'justify-end items-start space-x-5'}`}>
                                        {isBot ? (
                                            <>
                                                <Encode/>
                                                {/* 机器人头像 */}
                                                <Avatar
                                                    className="w-10 h-10 py-1 px-1 mt-6 border border-black/15 dark:border-white/15">
                                                    <MoonLogo className="w-full h-full"/>
                                                </Avatar>
                                                {/* 根据消息是否为最新的机器人消息和 isLoading 状态显示加载动画或者消息内容 */}
                                                <div className="p-4 max-w-[85%]">
                                                    <BlurAnimatedWrapper>
                                                        <motion.div
                                                            initial={{opacity: 0}}
                                                            animate={{opacity: 1}}
                                                            exit={{opacity: 0}}
                                                        >
                                                            {isLoading && isLatestBotMessage ? (
                                                                // 仅在 isLoading 且是最新机器人消息时显示动画
                                                                <AnimatedShinyText darkMode={false}
                                                                                   className="text mt-4"/>
                                                            ) : (
                                                                // 否则显示正常的 MarkdownRenderer
                                                                <MarkdownRenderer content={message.content}/>
                                                            )}
                                                        </motion.div>
                                                    </BlurAnimatedWrapper>
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
                                                        src={message.avatarUrl || "https://github.com/shuakami.png"}
                                                    />
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
        </AutoScrollToBottom>
    );
};
