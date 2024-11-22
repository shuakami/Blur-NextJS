// components/ChatComponent/BotMessage.tsx
import React, { memo, lazy, Suspense } from "react";
import { ThoughtProcess } from "@/types/stream";
import { Avatar } from "@/components/ui/avatar";
import MoonLogo from "../../../pages/logo";
import { useChatContext } from "@/app/[上下文]/ChatContext";
import MarkdownRenderer from "@/components/ui/markdown/MarkdownRenderer";
import { Agent } from './LLM/agent';


// 懒加载非关键组件
const AnimatedShinyText = lazy(() => 
    import("./animated-shiny-text").then(mod => ({
        default: mod.default || (() => null)
    }))
);

const ThoughtStream = lazy(() => 
    import("./chat/ThoughtStream").then(mod => ({
        default: mod.ThoughtStream || (() => null)
    }))
);

const MessageToolbar = lazy(() => 
    import("./message-toolbar").then(mod => ({
        default: mod.MessageToolbar || (() => null)
    }))
);

// 插件相关组件按需加载
const PluginComponents = {
    PluginCallingMessage: lazy(() => import("./LLM/PluginCallingMessage")),
    PluginResponseMessage: lazy(() => import("./LLM/PluginResponseMessage")),
    ErrorMessage: lazy(() => import("./chat-list/ErrorMessage")),
    Agent: lazy(() => import("./LLM/agent").then(mod => ({ default: mod.Agent })))
};

interface BotMessageProps {
    content: string;
    isLoading?: boolean;
    isLatestBotMessage: boolean;
    thought?: ThoughtProcess;
    error?: {
        code: number;
        message: string;
    };
}

// 插件数据处理函数
const renderPluginContent = (part: string, index: number) => {
    if (!part.startsWith('<plugin-data>')) return null;
    
    try {
        const pluginInfo = JSON.parse(
            part.replace('<plugin-data>', '').replace('</plugin-data>', '')
        );
        
        const PluginComponent = pluginInfo.status === 'calling' 
            ? PluginComponents.PluginCallingMessage 
            : PluginComponents.PluginResponseMessage;

        return (
            <Suspense key={index} fallback={null}>
                <PluginComponent {...pluginInfo} />
            </Suspense>
        );
    } catch (e) {
        console.error('Plugin data parsing failed:', e);
        return null;
    }
};

// agent 数据处理函数
const renderAgentContent = (part: string, index: number) => {
    if (!part.startsWith('<agent-data>')) return null;
    
    try {
        const agentInfo = JSON.parse(
            part.replace('<agent-data>', '').replace('</agent-data>', '')
        );
        
        return (
            <Suspense key={index} fallback={null}>
                <Agent data={agentInfo} />
            </Suspense>
        );
    } catch (e) {
        console.error('Agent data parsing failed:', e);
        return null;
    }
};

// Bot 消息组件
const BotMessage = memo(({ 
    content, 
    isLoading, 
    isLatestBotMessage,
    thought,
    error
}: BotMessageProps) => {
    const { isStreaming } = useChatContext();

    // 将内容按 plugin 和 agent 标记分割
    const parts = content.split(/(<plugin-data>.*?<\/plugin-data>|<agent-data>.*?<\/agent-data>)/s);
    
    return (
        <div className="group relative flex w-full items-start">
            {/* Avatar 容器 */}
            <div className="flex-shrink-0 pl-3 sm:pl-0">
                <Avatar className="h-9 w-9">
                    <MoonLogo className="relative p-1.5" />
                </Avatar>
            </div>

            {/* 内容容器 */}
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

                <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 w-full">
                    {isLoading && isLatestBotMessage ? (
                        <Suspense fallback={<div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />}>
                            <AnimatedShinyText darkMode={false} />
                        </Suspense>
                    ) : (
                        <>
                            {parts.map((part, index) => {
                                if (part.startsWith('<plugin-data>')) {
                                    return renderPluginContent(part, index);
                                }
                                if (part.startsWith('<agent-data>')) {
                                    return renderAgentContent(part, index);
                                }
                                return (
                                    <MarkdownRenderer 
                                        key={index} 
                                        content={part} 
                                        isStreaming={isStreaming && isLatestBotMessage}
                                    />
                                );
                            })}
                            {error && (
                                <Suspense fallback={<div className="animate-pulse h-4 bg-gray-200 rounded w-1/4" />}>
                                    <PluginComponents.ErrorMessage error={error} />
                                </Suspense>
                            )}
                        </>
                    )}
                </div>

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
