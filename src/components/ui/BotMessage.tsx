import React, { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import { motion } from "framer-motion";
import MoonLogo from "../../../pages/logo";
import BlurAnimatedWrapper from "../Animations/blur_text";
import AnimatedShinyText from "./animated-shiny-text";
import { ThoughtProcess } from "@/types/stream";
import { ThoughtStream } from "./chat/ThoughtStream";
import { MessageToolbar } from "./message-toolbar";

interface BotMessageProps {
    content: string;
    isLoading?: boolean;
    isLatestBotMessage: boolean;
    thought?: ThoughtProcess;
}

// Bot 消息组件
const BotMessage = memo(({ 
    content, 
    isLoading, 
    isLatestBotMessage,
    thought
}: BotMessageProps) => {
    return (
        <div className="group relative flex max-w-full items-start gap-1 sm:gap-2 md:gap-4 lg:gap-6">
            <Avatar className="h-10 w-10 flex-shrink-0">
                <MoonLogo className="relative p-1" />
            </Avatar>

            <div className="flex flex-col gap-1.5 min-w-0">
                {/* 思考流组件 */}
                {thought && (
                    <ThoughtStream
                        duration={thought.duration || 0}
                        content={thought.content || ''}
                        isAnimating={thought.isAnimating || false}
                    />
                )}

                <BlurAnimatedWrapper>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="prose-container"
                    >
                        {isLoading && isLatestBotMessage ? (
                            <AnimatedShinyText darkMode={false} />
                        ) : (
                            <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:my-3">
                                <MarkdownRenderer content={content} />
                            </div>
                        )}
                    </motion.div>
                </BlurAnimatedWrapper>

                {/* 工具栏 - hover时显示 */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-1 flex items-center">
                    <MessageToolbar 
                        onVoicePlay={() => console.log('播放语音')}
                        onCopy={() => console.log('复制内容')}
                        onLike={() => console.log('点赞')}
                        onDislike={() => console.log('踩')}
                        onReset={() => console.log('重置')}
                    />
                </div>
            </div>
        </div>
    );
});

BotMessage.displayName = 'BotMessage';
export default BotMessage; 