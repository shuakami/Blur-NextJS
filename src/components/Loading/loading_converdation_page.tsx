'use client'

import React, { memo } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import ChatSidebarLoading from "@/components/Loading/loading_chat_sidebar";

// 1. 常量定义
const SIDEBAR_WIDTH = 220;
const MESSAGE_COUNT = 3;

// 2. 动画配置
const ANIMATION_CLASSES = {
    container: "transition-all duration-300 ease-out",
    fadeIn: "animate-fadeIn",
    slideUp: "animate-slideUp",
    stagger: "animate-stagger"
};

// 3. 优化用户消息骨架屏
const UserMessageSkeleton = memo(({ index }: { index: number }) => (
    <div 
        className={`flex justify-end mb-6 ${ANIMATION_CLASSES.slideUp}`}
        style={{ 
            '--animation-delay': `${index * 0.15}s`
        } as React.CSSProperties}
    >
        <div className="max-w-[70%]">
            <Skeleton className="h-[52px] w-[280px] rounded-3xl bg-black/5 dark:bg-white/5" />
        </div>
    </div>
));

// 4. 优化机器人消息骨架屏
const BotMessageSkeleton = memo(({ index }: { index: number }) => (
    <div 
        className={`flex items-start mb-6 ${ANIMATION_CLASSES.slideUp}`}
        style={{ 
            '--animation-delay': `${index * 0.15 + 0.1}s`
        } as React.CSSProperties}
    >
        <Skeleton className="h-9 w-9 rounded-full mr-4 flex-shrink-0 bg-black/5 dark:bg-white/5" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[90%] rounded bg-black/5 dark:bg-white/5" />
            <Skeleton className="h-4 w-[80%] rounded bg-black/5 dark:bg-white/5" />
            <Skeleton className="h-4 w-[60%] rounded bg-black/5 dark:bg-white/5" />
        </div>
    </div>
));

UserMessageSkeleton.displayName = 'UserMessageSkeleton';
BotMessageSkeleton.displayName = 'BotMessageSkeleton';

// 5. 优化主组件
const LoadingConversationPage = memo(() => {
    return (
        <div className="w-full h-screen flex overflow-hidden bg-white dark:bg-[#212121]">
            {/* 侧边栏 */}
            <div
                className={`fixed top-0 left-0 h-full z-50 overflow-hidden ${ANIMATION_CLASSES.fadeIn}`}
                style={{ width: SIDEBAR_WIDTH }}
            >
                <ChatSidebarLoading />
            </div>

            {/* 主内容区域 */}
            <div
                className="flex flex-col h-full w-full overflow-hidden transition-all duration-300"
                style={{ marginLeft: SIDEBAR_WIDTH }}
            >
                {/* 聊天内容 */}
                <div className="flex-1 overflow-auto w-full pt-[40px] scroll-container">
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        {Array.from({ length: MESSAGE_COUNT }).map((_, index) => (
                            <React.Fragment key={index}>
                                <UserMessageSkeleton index={index * 2} />
                                <BotMessageSkeleton index={index * 2 + 1} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* 底部输入框占位 */}
                <footer className="p-4 flex flex-col items-center w-full bg-transparent">
                    <div className="w-full max-w-3xl">
                        <Skeleton className="h-[52px] w-full rounded-3xl bg-black/5 dark:bg-white/5" />
                        <div className="mt-3 flex justify-center">
                            <Skeleton className="h-4 w-32 bg-black/5 dark:bg-white/5" />
                        </div>
                    </div>
                    <div className="h-3" />
                </footer>
            </div>
        </div>
    )
});

LoadingConversationPage.displayName = 'LoadingConversationPage';

export default LoadingConversationPage;