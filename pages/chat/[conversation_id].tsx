"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense, lazy, memo } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ChatProvider } from "@/app/[上下文]/ChatContext";
import { fetchHistory } from '@/app/[拉取历史]/fetch_history';
import { useConversations } from '../../contexts/ConversationsContext';

import Cookies from "js-cookie";
import ChatList from '@/app/[消息显示]/chat_list';

const MessagesSidebar = lazy(() => import('@/app/[侧边栏管理]/messages_sidebar'));
const ChatInputWrapper = lazy(() => import('@/components/ui/ChatInputWrapper'));
const CText = lazy(() => import('@/app/copyright/ctext'));
const SimplifiedUnauthenticatedHomePage = lazy(() => import("@/components/NoLogin/nologin_home"));
const Meta = lazy(() => import("@/components/ui/Meta"));
const ModelSelector = lazy(() => import("@/components/ui/model_selector"));
const HomeHeaderIcon = lazy(() => import('@/app/[首页占位]/home_header_icon'));
const Overlay = lazy(() => import('@/components/ui/overlay/index'));
const ScrollDownButton = lazy(() => import('@/components/ui/scroll-down-button'));

const SIDEBAR_WIDTH = 220;
const MAX_RETRY_COUNT = 3;

const useWindowSize = () => {
    const [width, setWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0
    );

    useEffect(() => {
        let rafId: number;
        const handleResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setWidth(window.innerWidth);
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return width;
};

const MemoizedOverlay = memo(Overlay);

export default function ChatPage() {
    const router = useRouter();
    const { conversation_id } = router.query;
    const { conversations } = useConversations(); 
    const [exists, setExists] = useState<boolean | null>(null);
    const { isSignedIn, isLoaded, user } = useUser();
    const [isFullyLoaded, setIsFullyLoaded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        const storedState = Cookies.get('isSidebarOpen');
        return storedState ? storedState === 'true' : true;
    });
    const [retryCount, setRetryCount] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const windowWidth = useWindowSize();
    const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);

    const chat_title = useMemo(() => {
        const currentConversation = conversations.find(c => c.conversation_id === conversation_id);
        return currentConversation?.chat_title || '未命名对话';
    }, [conversations, conversation_id]);

    const sidebarAnimationConfig = useMemo(() => ({
        duration: 0.55,
        ease: [0.25, 0.8, 0.25, 1],
    }), []);

    const modelSelectorStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: isMobile 
            ? '50%' 
            : isSidebarOpen 
                ? '14.55rem' 
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
        if (!isLoaded) return;
        if (!isSignedIn) {
            setExists(false);
            return;
        }
        if (!conversation_id || typeof conversation_id !== 'string') return;

        const checkConversationExists = async (retryCount: number) => {
            try {
                const history = await fetchHistory({ user_id: user?.id, conversation_id, limit: 1 });
                setExists(history && history.messages.length > 0);
            } catch (error) {
                if (retryCount < MAX_RETRY_COUNT) {
                    setRetryCount(prev => prev + 1);
                    checkConversationExists(retryCount + 1);
                } else {
                    setExists(false);
                }
            }
        };

        checkConversationExists(retryCount);
    }, [conversation_id, isSignedIn, isLoaded, user?.id, retryCount]);

    useEffect(() => {
        if (exists === false && isSignedIn) {
            router.replace('/');
        }
    }, [exists, router, isSignedIn]);

    useEffect(() => {
        if (isLoaded && isClient && exists !== null) {
            const timer = setTimeout(() => {
                setIsFullyLoaded(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, isClient, exists]);

    if (!isLoaded) {
        return null;
    }
    
    if (!isSignedIn) {
        return (
            <Suspense fallback={null}>
                <SimplifiedUnauthenticatedHomePage/>
            </Suspense>
        );
    }

    if (exists === false && isSignedIn) {
        router.replace('/');
    }

    if (!conversation_id || typeof conversation_id !== 'string') {
        return null;
    }

    return (
        <ChatProvider initialConversationId={conversation_id}>
            <Suspense fallback={null}>
                <Meta pageName={chat_title}/> 
            </Suspense>
            <main className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {isClient && (
                    <>
                        {/* 侧边栏 */}
                        <nav>
                            <motion.div className="h-full z-40 fixed top-0 left-0"
                                style={{ width: SIDEBAR_WIDTH }}
                                initial={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                                animate={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                                transition={sidebarAnimationConfig}
                            >
                                <Suspense fallback={null}>
                                    <MessagesSidebar onClose={toggleSidebar}/>
                                </Suspense>
                            </motion.div>
                        </nav>

                        {/* 侧边栏遮罩层（移动端Only） */}
                        <Suspense fallback={null}>
                            <MemoizedOverlay 
                                isOpen={isSidebarOpen && isMobile} 
                                onClose={toggleSidebar}
                                zIndex={35}
                            />
                        </Suspense>

                        {/* 主内容 */}
                        <motion.div className="flex flex-col h-full overflow-hidden w-full"
                            style={{ 
                                marginLeft: isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0 
                            }}
                            initial={false}
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
                                            <ModelSelector/>
                                        </motion.div>
                                    </Suspense>
                                </div>
                            </header>

                            {/* 聊天内容 */}
                            <section className="flex-1 overflow-auto w-full pt-12 scroll-container"> 
                                <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                    <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-custom-lg xl:max-w-custom-xl">
                                        <ChatList />
                                    </div>
                                </div>
                            </section>

                            {/* 底部输入框&版权 */}
                            <footer>
                                <motion.div>
                                    <div className="flex flex-col items-center w-full bg-transparent">
                                        <div className="w-full max-w-4xl">
                                            <Suspense fallback={null}>
                                                <ChatInputWrapper/>
                                            </Suspense>
                                        </div>
                                        <motion.div 
                                            className="w-full"
                                            initial={{ opacity: 0, height: "24px" }}
                                            animate={{ opacity: 1, height: "24px" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Suspense fallback={null}>
                                                <CText />
                                            </Suspense>
                                        </motion.div>
                                        <div className="mb-3"/>
                                    </div>
                                </motion.div>
                            </footer>
                        </motion.div>

                        {/* 滚动按钮 */}
                        <Suspense fallback={null}>
                            <ScrollDownButton isSidebarOpen={isSidebarOpen} sidebarWidth={SIDEBAR_WIDTH} />
                        </Suspense>
                    </>
                )}
            </main>
        </ChatProvider>
    );
}
ChatPage.displayName = 'ChatPage';
