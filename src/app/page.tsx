// page.tsx

"use client";

import React, { useEffect, useState, Suspense, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { ChatProvider, useChatContext } from '@/app/[上下文]/ChatContext';
import { ConversationsProvider } from "../../contexts/ConversationsContext";
import { motion, AnimatePresence } from 'framer-motion';

import Cookies from 'js-cookie';
import HomepageContent from "@/app/[首页占位]/home-content";

const MessagesSidebar = React.lazy(() => import('@/app/[侧边栏管理]/messages_sidebar'));
const ChatInputWrapper = React.lazy(() => import('@/components/ui/ChatInputWrapper'));
const ChatList = React.lazy(() => import('@/app/[消息显示]/chat_list'));
const UserAvatar = React.lazy(() => import('@/components/ui/page_right_user_avatar'));
const ModelSelector = React.lazy(() => import("@/components/ui/model_selector"));
const CText = React.lazy(() => import('@/app/copyright/ctext'));
const HomeHeaderIcon = React.lazy(() => import('./[首页占位]/home_header_icon'));
const Overlay = React.lazy(() => import('@/components/ui/overlay/index'));
const ScrollDownButton = React.lazy(() => import('@/components/ui/scroll-down-button'));

const SIDEBAR_WIDTH = 220;

// 优化后的 useWindowSize Hook，避免不必要的重新渲染
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        let rafId: number;
        const handleResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return windowSize;
};

// Memoized Overlay to prevent unnecessary re-renders
const MemoizedOverlay = memo(Overlay);

// 定义动画配置
const sidebarAnimationConfig = {
    duration: 0.55,
    ease: [0.25, 0.8, 0.25, 1],
};

// 淡入淡出动画
const fadeInUpAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
};

// 主页面组件
export default function Home() {
    return (
        <ConversationsProvider>
            <ChatProvider>
                <HomeContent />
            </ChatProvider>
        </ConversationsProvider>
    );
}

// HomeContent 组件
const HomeContent = () => {
    const router = useRouter();
    const { newConversationId, resetNewConversationId } = useChatContext();
    const [hasConversation, setHasConversation] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        const storedState = Cookies.get('isSidebarOpen');
        return storedState ? storedState === 'true' : true;
    });
    const [isClient, setIsClient] = useState(false);
    const { width: windowWidth } = useWindowSize();

    const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);

    const modelSelectorStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: isMobile 
            ? '50%' 
            : isSidebarOpen 
                ? '13.5rem' 
                : '6rem',
        transform: isMobile 
            ? 'translateX(-50%)' 
            : 'translateX(0)',
    }), [isMobile, isSidebarOpen]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            Cookies.set('isSidebarOpen', newState.toString(), { expires: 7 });
            return newState;
        });
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!newConversationId) return;
        
        const updateUrl = async () => {
            try {
                // 先更新 URL
                await router.replace(`/chat/${newConversationId}`, { 
                    scroll: false,  // 防止页面滚动
                });
                
                // 然后更新状态
                requestAnimationFrame(() => {
                    setHasConversation(true);
                    resetNewConversationId();
                });
            } catch (error) {
                console.error('Failed to update URL:', error);
                // 即使 URL 更新失败，也要确保状态更新
                setHasConversation(true);
                resetNewConversationId();
            }
        };

        updateUrl();
    }, [newConversationId, resetNewConversationId, router]);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const isHomePage = window.location.pathname === '/';
            if (isHomePage) {
                setHasConversation(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return (
        <div className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
            {isClient && (
                <>
                    {/* 侧边栏 */}
                    <motion.div
                        className="h-full z-40 fixed top-0 left-0"
                        style={{ width: SIDEBAR_WIDTH }}
                        initial={{ x: -SIDEBAR_WIDTH }}
                        animate={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                        transition={sidebarAnimationConfig}
                    >
                        <Suspense fallback={null}>
                            <MessagesSidebar onClose={toggleSidebar} />
                        </Suspense>
                    </motion.div>

                    {/* 侧边栏遮罩层（移动端Only） */}
                    <Suspense fallback={null}>
                        <MemoizedOverlay 
                            isOpen={isSidebarOpen && isMobile} 
                            onClose={toggleSidebar}
                            zIndex={35}
                        />
                    </Suspense>

                    {/* 主内容 */}
                    <motion.div
                        className="flex flex-col h-full overflow-hidden w-full"
                        style={{ 
                            marginLeft: isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0 
                        }}
                        animate={{
                            marginLeft: isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0,
                        }}
                        transition={{
                            duration: 0.65,
                            ease: [0.25, 0.8, 0.25, 1],
                        }}
                    >
                        {/* 头部工具栏 */}
                        <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-[#212121] z-30">
                            <div className="flex items-center gap-3 w-full">
                                <Suspense fallback={null}>
                                    <HomeHeaderIcon isSidebarOpen={isSidebarOpen} onOpen={toggleSidebar}/>
                                </Suspense>
                                <Suspense fallback={null}>
                                    <motion.div
                                        className={`flex items-center ${isMobile ? 'flex-1 justify-center' : ''}`}
                                        style={modelSelectorStyle}
                                        animate={{
                                            left: isMobile 
                                                ? '50%' 
                                                : isSidebarOpen 
                                                    ? '14.55rem' 
                                                    : '6rem',
                                        }}
                                    >
                                        <ModelSelector />
                                    </motion.div>
                                </Suspense>
                                <div className="ml-auto">
                                    <Suspense fallback={null}>
                                        <UserAvatar />
                                    </Suspense>
                                </div>
                            </div>
                        </header>

                        {/* 聊天内容 */}
                        <AnimatePresence mode="wait">
                            {hasConversation ? (
                                <motion.div 
                                    key="conversation"
                                    className="flex-1 overflow-auto w-full pt-12 scroll-container"
                                    {...fadeInUpAnimation}
                                >
                                    <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                        <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]">
                                            <Suspense fallback={null}>
                                                <ChatList />
                                            </Suspense>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="homepage"
                                    className="flex justify-center items-center h-full pt-20"
                                    {...fadeInUpAnimation}
                                >
                                    <HomepageContent 
                                        onFirstMessage={() => setHasConversation(true)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 底部输入框&版权 */}
                        {hasConversation && (
                            <motion.div 
                                className="flex flex-col items-center w-full bg-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ 
                                    duration: 0.4,
                                    delay: 0.2,
                                    ease: "easeOut"
                                }}
                            >
                                <div className="w-full max-w-4xl">
                                    <Suspense fallback={null}>
                                        <ChatInputWrapper 
                                            onFirstMessage={() => setHasConversation(true)} 
                                        />
                                    </Suspense>
                                </div>
                                <Suspense fallback={null}>
                                    <CText />
                                </Suspense>
                                <div className="mb-3"/>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* 滚动按钮 */}
                    <Suspense fallback={null}>
                        <ScrollDownButton isSidebarOpen={isSidebarOpen} sidebarWidth={SIDEBAR_WIDTH} />
                    </Suspense>
                </>
            )}
        </div>
    );
};
HomeContent.displayName = 'HomeContent';
