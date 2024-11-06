import React, { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/ui/markdown/MarkdownRenderer";
import { motion } from "framer-motion";
import MoonLogo from "../../../pages/logo";
import BlurAnimatedWrapper from "../Animations/blur_text";
import AnimatedShinyText from "./animated-shiny-text";

// Bot 消息组件
const BotMessage = memo(({ content, isLoading, isLatestBotMessage }: {
    content: string;
    isLoading?: boolean;
    isLatestBotMessage: boolean;
}) => {
    console.log("渲染 BotMessage:", { content, isLoading, isLatestBotMessage }); // 加渲染log
    return (
        <div className="flex mt-4 items-start gap-1 sm:gap-2 md:gap-4 lg:gap-6">
            <Avatar className="h-10 w-10 flex-shrink-0">
                <MoonLogo className="relative p-1 h-full w-full" />
            </Avatar>

            <div className="flex flex-col gap-1.5 min-w-0">
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

                <div className="flex items-center gap-2 mt-0.5">
                    {/* 这里可以添加操作按钮，比如复制、点赞等 */}
                </div>
            </div>
        </div>
    );
});

BotMessage.displayName = 'BotMessage';
export default BotMessage; 