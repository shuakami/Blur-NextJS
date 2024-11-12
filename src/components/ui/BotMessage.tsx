import React, { memo, lazy, Suspense } from "react";
import { ThoughtProcess } from "@/types/stream";
import MarkdownRenderer from "@/components/ui/markdown/MarkdownRenderer";
import { Avatar } from "@/components/ui/avatar";
import MoonLogo from "../../../pages/logo";

// 懒加载组件
const AnimatedShinyText = lazy(() => import("./animated-shiny-text"));
const ThoughtStream = lazy(() => import("./chat/ThoughtStream").then(module => ({ default: module.ThoughtStream })));
const MessageToolbar = lazy(() => import("./message-toolbar").then(module => ({ default: module.MessageToolbar })));

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
        <div className="group relative flex w-full items-start">
            {/* Avatar 容器 */}
            <div className="flex-shrink-0 pl-3 sm:pl-0">
                <Avatar className="h-9 w-9">
                    <MoonLogo className="relative p-1.5" />
                </Avatar>
            </div>

            {/* 内容容器 - 移除右侧 padding */}
            <div className="flex flex-col min-w-0 flex-1 gap-1.5 ml-4">
                {thought && (
                    <Suspense fallback={null}>
                        <ThoughtStream
                            duration={thought.duration || 0}
                            content={thought.content || ''}
                            isAnimating={thought.isAnimating || false}
                        />
                    </Suspense>
                )}

                <Suspense fallback={null}>
                    {isLoading && isLatestBotMessage ? (
                        <AnimatedShinyText darkMode={false} />
                    ) : (
                        <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 w-full">
                            <MarkdownRenderer content={content} />
                        </div>
                    )}
                </Suspense>

                {/* 工具栏 */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-1 flex items-center">
                    <Suspense fallback={null}>
                        <MessageToolbar 
                            onVoicePlay={() => console.log('播放语音')}
                            onCopy={() => console.log('复制内容')}
                            onLike={() => console.log('点赞')}
                            onDislike={() => console.log('踩')}
                            onReset={() => console.log('重置')}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
});

BotMessage.displayName = 'BotMessage';
export default BotMessage; 