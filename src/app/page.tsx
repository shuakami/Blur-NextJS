"use client";

import React, { useEffect, useState, Suspense, useMemo, useCallback, memo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChatProvider, useChatContext } from '@/app/[上下文]/ChatContext';
import { ConversationsProvider } from "../../contexts/ConversationsContext";
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import HomepageContent from "@/app/[首页占位]/home-content";
import Meta from '@/components/ui/Meta';

// 动态导入
const MessagesSidebar = dynamic(() => import('@/app/[侧边栏管理]/messages_sidebar'), {
  ssr: false,
  loading: () => null
});
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), {
  ssr: false,
  loading: () => null
});
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), {
  ssr: false,
  loading: () => null
});
const UserAvatar = dynamic(() => import('@/components/ui/page_right_user_avatar'), {
  ssr: false,
  loading: () => null
});
const ModelSelector = dynamic(() => import('@/components/ui/model_selector'), {
  ssr: false,
  loading: () => null
});
const CText = dynamic(() => import('@/app/copyright/ctext'), {
  ssr: false,
  loading: () => null
});
const HomeHeaderIcon = dynamic(() => import('./[首页占位]/home_header_icon'), {
  ssr: false,
  loading: () => null
});
const Overlay = dynamic(() => import('@/components/ui/overlay/index'), {
  ssr: false,
  loading: () => null
});
const ScrollDownButton = dynamic(() => import('@/components/ui/scroll-down-button'), {
  ssr: false,
  loading: () => null
});

const SIDEBAR_WIDTH = 220;

// 优化窗口大小监听
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState<{width: number; height: number}>({
        width: 0,
        height: 0
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            };

            handleResize();

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return windowSize;
};

// 动画配置
const animations = {
    sidebar: {
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.8,
        duration: 0.7
    },
    homepageExit: {
        initial: { opacity: 1, y: 0 },
        exit: { 
            opacity: 0,
            y: -60,
            transition: {
                opacity: { duration: 0.3, ease: "easeOut" },
                y: { 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }
            }
        }
    }
};

// 遮罩层
const MemoizedOverlay = memo(Overlay);

// 优化主页面组件
const Home = memo(function Home() {
    return (
        <LazyMotion features={domAnimation}>
            <ConversationsProvider>
                <ChatProvider>
                    <HomeContent />
                </ChatProvider>
            </ConversationsProvider>
        </LazyMotion>
    );
});

// 优化 HomeContent 组件
const HomeContent = memo(() => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { newConversationId, resetNewConversationId, resetChatState } = useChatContext();
    const [hasConversation, setHasConversation] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const windowSize = useWindowSize();
    const [chatTitle, setChatTitle] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedState = Cookies.get('isSidebarOpen');
        setIsSidebarOpen(storedState === 'true');
    }, []);

    const isMobile = useMemo(() => {
        if (!mounted) return false;
        return windowSize.width < 768;
    }, [windowSize.width, mounted]);

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
        if (!mounted || !newConversationId) return;

        const handleNewConversation = (event: CustomEvent) => {
            const { chat_title } = event.detail;
            setChatTitle(chat_title);
        };

        window.addEventListener('addConversation', handleNewConversation as EventListener);
        
        const updateUrl = () => {
            window.history.pushState(
                { conversationId: newConversationId },
                '',
                `/chat/${newConversationId}`
            );
            setHasConversation(true);
            resetNewConversationId();
        };

        updateUrl();

        return () => {
            window.removeEventListener('addConversation', handleNewConversation as EventListener);
        };
    }, [newConversationId, resetNewConversationId, mounted]);

    useEffect(() => {
        if (!mounted) return;

        const preloadComponents = async () => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(async () => {
                    await Promise.all([
                        import('@/app/[侧边栏管理]/messages_sidebar'),
                        import('@/components/ui/ChatInputWrapper'),
                        import('@/app/[消息显示]/chat_list')
                    ]);
                });
            }
        };
        preloadComponents();
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    return (
        <>
            <Meta 
                pageName={chatTitle || undefined}
                pageDescription={hasConversation ? "Chat" : undefined}
            />
            <div className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {/* 侧边栏 */}
                <motion.div
                    className="h-full z-40 fixed top-0 left-0"
                    style={{ 
                        width: SIDEBAR_WIDTH,
                        transform: `translateX(${isSidebarOpen ? 0 : -SIDEBAR_WIDTH}px)`
                    }}
                    animate={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                    transition={animations.sidebar}
                >
                    <Suspense fallback={null}>
                        <MessagesSidebar onClose={toggleSidebar} />
                    </Suspense>
                </motion.div>

                {isSidebarOpen && isMobile && (
                    <MemoizedOverlay isOpen={isSidebarOpen} onClose={toggleSidebar} />
                )}

                {/* 主内容区域 */}
                <motion.div
                    className="flex flex-col h-full overflow-hidden w-full"
                    initial={{
                        marginLeft: isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0,
                    }}
                    animate={{
                        marginLeft: isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0,
                    }}
                    transition={animations.sidebar}
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
                    {hasConversation ? (
                        <div 
                            key="chat-container"
                            className="flex-1 overflow-auto w-full pt-12 scroll-container"
                        >
                            <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                <div 
                                    className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]"
                                >
                                    <Suspense fallback={null}>
                                        <ChatList />
                                    </Suspense>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <motion.div 
                            key="homepage"
                            className="flex justify-center items-center h-full"
                            {...animations.homepageExit}
                        >
                            <HomepageContent 
                                onFirstMessage={() => setHasConversation(true)}
                            />
                        </motion.div>
                    )}

                    {/* 底部输入框区域 */}
                    {hasConversation && (
                        <div className="flex flex-col items-center w-full bg-transparent">
                            <div className="w-full max-w-4xl">
                                <Suspense fallback={null}>
                                    <ChatInputWrapper 
                                        onFirstMessage={() => setHasConversation(true)} 
                                    />
                                </Suspense>
                            </div>
                            <div>
                                <Suspense fallback={null}>
                                    <CText />
                                </Suspense>
                            </div>
                            <div className="mb-3"/>
                        </div>
                    )}
                </motion.div>

                {/* 滚动按钮 */}
                <Suspense fallback={null}>
                    <ScrollDownButton isSidebarOpen={isSidebarOpen} sidebarWidth={SIDEBAR_WIDTH} />
                </Suspense>
            </div>
        </>
    );
});

HomeContent.displayName = 'HomeContent';

export default Home;