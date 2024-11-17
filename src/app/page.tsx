// page.tsx

"use client";

import React, { useEffect, useState, Suspense, useMemo, useCallback, memo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChatProvider, useChatContext } from '@/app/[上下文]/ChatContext';
import { ConversationsProvider } from "../../contexts/ConversationsContext";
import { motion, AnimatePresence } from 'framer-motion';

import Cookies from 'js-cookie';
import HomepageContent from "@/app/[首页占位]/home-content";
import Meta from '@/components/ui/Meta';
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

// 优化动画配置
const animations = {
    // 主页面退场
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
    },
    // 聊天界面入场
    chatEnter: {
        initial: { 
            opacity: 0,
            y: 20,
        },
        animate: { 
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,  // 等待主页面退场
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1]
            }
        }
    },
    // 输入框
    inputEnter: {
        initial: { 
            opacity: 0,
            y: 40,
        },
        animate: { 
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.3,
                y: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                },
                opacity: {
                    duration: 0.3
                }
            }
        }
    }


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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { newConversationId, resetNewConversationId, resetChatState } = useChatContext();
    const [hasConversation, setHasConversation] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        const storedState = Cookies.get('isSidebarOpen');
        return storedState ? storedState === 'true' : true;
    });
    const [isClient, setIsClient] = useState(false);
    const { width: windowWidth } = useWindowSize();
    const [chatTitle, setChatTitle] = useState<string | null>(null);

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
        
        // 监听新对话创建事件，获取标题
        const handleNewConversation = (event: CustomEvent) => {
            const { chat_title } = event.detail;
            setChatTitle(chat_title);
        };

        window.addEventListener('addConversation', handleNewConversation as EventListener);
        
        const updateUrl = () => {
            Promise.resolve()
                .then(() => {
                    window.history.pushState(
                        { conversationId: newConversationId },
                        '',
                        `/chat/${newConversationId}`
                    );
                    console.log('URL 更新成功:', `/chat/${newConversationId}`);
                })
                .then(() => {
                    setHasConversation(true);
                    resetNewConversationId();
                })
                .catch((error) => {
                    console.error('Failed to update URL:', error);
                    setHasConversation(true);
                    resetNewConversationId();
                });
        };

        updateUrl();

        return () => {
            window.removeEventListener('addConversation', handleNewConversation as EventListener);
        };
    }, [newConversationId, resetNewConversationId]);

    const handleNewChat = useCallback(() => {
        setHasConversation(false);
        resetChatState();
        const newSearchParams = new URLSearchParams(searchParams || '');
        newSearchParams.delete('new');
        
        const newUrl = newSearchParams.toString() 
            ? `${pathname}?${newSearchParams.toString()}`
            : pathname;
        
        router.replace(newUrl || '', { scroll: false });
    }, [pathname, searchParams, router, resetChatState]);

    useEffect(() => {
        if (!searchParams || searchParams.get('new') !== 'true') return;
        handleNewChat();
    }, [searchParams, handleNewChat]);

    return (
        <>
            <Meta 
                pageName={chatTitle || undefined}
                pageDescription={hasConversation ? "Chat" : undefined}
            />
            <div className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {isClient && (
                    <>
                        {/* 侧边栏 */}
                        <motion.div
                            className="h-full z-40 fixed top-0 left-0"
                            style={{ width: SIDEBAR_WIDTH }}
                            initial={{ x: -SIDEBAR_WIDTH }}
                            animate={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                            transition={{ 
                                type: "spring",
                                stiffness: 150,
                                damping: 25,
                                mass: 0.8,
                                duration: 0.7
                            }}
                        >
                            <Suspense fallback={null}>
                                <MessagesSidebar onClose={toggleSidebar} />
                            </Suspense>
                        </motion.div>

                        {/* 遮罩层 */}
                        <AnimatePresence>
                            {isSidebarOpen && isMobile && (
                                <motion.div
                                    className="fixed inset-0 bg-black/30 z-35"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.32, 0.72, 0, 1]
                                    }}
                                    onClick={toggleSidebar}
                                />
                            )}
                        </AnimatePresence>

                        {/* 主内容区域 */}
                        <motion.div
                            className="flex flex-col h-full overflow-hidden w-full"
                            animate={{
                                marginLeft: isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 25,
                                mass: 0.8,
                                duration: 0.7
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
                                        key="chat-container"
                                        className="flex-1 overflow-auto w-full pt-12 scroll-container"
                                        {...animations.chatEnter}
                                    >
                                        <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                            <motion.div 
                                                className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.15 }}
                                            >
                                                <Suspense fallback={null}>
                                                    <ChatList />
                                                </Suspense>
                                            </motion.div>
                                        </div>
                                    </motion.div>
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
                            </AnimatePresence>

                            {/* 底部输入框区域 */}
                            <AnimatePresence>
                                {hasConversation && (
                                    <motion.div 
                                        className="flex flex-col items-center w-full bg-transparent"
                                        initial="initial"
                                        animate="animate"
                                        variants={{
                                            initial: { opacity: 0 },
                                            animate: { opacity: 1 }
                                        }}
                                    >
                                        <motion.div 
                                            className="w-full max-w-4xl"
                                            variants={animations.inputEnter}
                                        >
                                            <Suspense fallback={null}>
                                                <ChatInputWrapper 
                                                    onFirstMessage={() => setHasConversation(true)} 
                                                />
                                            </Suspense>
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                initial: { opacity: 0 },
                                                animate: { 
                                                    opacity: 1,
                                                    transition: { delay: 0.3 }
                                                }
                                            }}
                                        >
                                            <Suspense fallback={null}>
                                                <CText />
                                            </Suspense>
                                        </motion.div>
                                        <div className="mb-3"/>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* 滚动按钮 */}
                        <Suspense fallback={null}>
                            <ScrollDownButton isSidebarOpen={isSidebarOpen} sidebarWidth={SIDEBAR_WIDTH} />
                        </Suspense>
                    </>
                )}
            </div>
        </>
    );
};
HomeContent.displayName = 'HomeContent';
