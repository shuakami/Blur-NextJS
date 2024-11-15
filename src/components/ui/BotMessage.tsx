// components/ChatComponent/BotMessage.tsx
import React, { memo, lazy, Suspense } from "react";
import { ThoughtProcess } from "@/types/stream";
import MarkdownRenderer from "@/components/ui/markdown/MarkdownRenderer";
import { Avatar } from "@/components/ui/avatar";
import MoonLogo from "../../../pages/logo";
import PluginCallingMessage from "./LLM/PluginCallingMessage";
import PluginResponseMessage from "./LLM/PluginResponseMessage";
import ErrorMessage from "./chat-list/ErrorMessage";


// 懒加载组件
const AnimatedShinyText = lazy(() => import("./animated-shiny-text"));
const ThoughtStream = lazy(() => import("./chat/ThoughtStream").then(module => ({ default: module.ThoughtStream })));
const MessageToolbar = lazy(() => import("./message-toolbar").then(module => ({ default: module.MessageToolbar })));

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

// Bot 消息组件
const BotMessage = memo(({ 
    content, 
    isLoading, 
    isLatestBotMessage,
    thought,
    error
}: BotMessageProps) => {

    // 将内容按插件标记分割，使用新的正则表达式
    const parts = content.split(/(<plugin-data>.*?<\/plugin-data>)/s);
    
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

                <Suspense fallback={null}>
                    {isLoading && isLatestBotMessage ? (
                        <div className="flex items-center">
                            <AnimatedShinyText darkMode={false} />
                        </div>
                    ) : (
                        <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 w-full">
                            {parts.map((part, index) => {
                                if (part.startsWith('<plugin-data>')) {
                                    try {
                                        // 提取插件数据
                                        const pluginInfo = JSON.parse(
                                            part.replace('<plugin-data>', '').replace('</plugin-data>', '')
                                        );
                                        
                                        if (pluginInfo.status === 'calling') {
                                            return (
                                                <PluginCallingMessage
                                                    key={index}
                                                    content={content}
                                                    plugin_id={pluginInfo.plugin_id?.toString()}
                                                    plugin_name={pluginInfo.plugin_name}
                                                />
                                            );
                                        }
                                        
                                        if (pluginInfo.status === 'response') {
                                            return (
                                                <PluginResponseMessage
                                                    key={index}
                                                    content={content}
                                                    plugin_response={pluginInfo.plugin_response}
                                                />
                                            );
                                        }
                                    } catch (e) {
                                        console.error('解析插件数据失败:', e);
                                    }
                                    return null;
                                }
                                
                                return <MarkdownRenderer key={index} content={part} />;
                            })}
                            {error && <ErrorMessage error={error} />}
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
