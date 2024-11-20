"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense, lazy, memo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { ChatProvider } from "@/app/[上下文]/ChatContext";
import { fetchHistory } from '@/app/[拉取历史]/fetch_history';
import { useConversations } from '../../contexts/ConversationsContext';
import { SHARED_ANIMATIONS } from '@/lib/animations/config';
import { motion } from 'framer-motion';
import Cookies from "js-cookie";
import ChatList from '@/app/[消息显示]/chat_list';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import NoConversationFound from '@/components/chat/NoConversationFound';

const ChatInputWrapper = lazy(() => 
    import('@/components/ui/ChatInputWrapper').then(mod => ({
        default: memo(mod.default)
    }))
);
const CText = lazy(() => 
    import('@/app/copyright/ctext').then(mod => ({
        default: memo(mod.default)
    }))
);
const SimplifiedUnauthenticatedHomePage = lazy(() => 
    import("@/components/NoLogin/nologin_home")
);

const Meta = lazy(() => import("@/components/ui/Meta"));
const ModelSelector = lazy(() => import("@/components/ui/model_selector"));
const HomeHeaderIcon = lazy(() => import('@/app/[首页占位]/home_header_icon'));
const Overlay = lazy(() => import('@/components/ui/overlay/index'));
const ScrollDownButton = lazy(() => import('@/components/ui/scroll-down-button'));

const SIDEBAR_WIDTH = 220;
const MAX_RETRY_COUNT = 3;
const MOBILE_BREAKPOINT = 768;

const useWindowSize = () => {
    const [width, setWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        let rafId: number;
        const handleResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setWidth(window.innerWidth);
            });
        };

        window.addEventListener('resize', handleResize, { passive: true });
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return width;
};

const MemoizedOverlay = memo(Overlay);

const ChatPage = memo(() => {
    const router = useRouter();
    const { conversation_id } = router.query;
    const { conversations } = useConversations();
    const { isSignedIn, isLoaded, user } = useUser();

    const [state, setState] = useState({
        exists: null as boolean | null,
        isFullyLoaded: false,
        isSidebarOpen: (() => {
            if (typeof window === "undefined") return true;
            return Cookies.get('isSidebarOpen') !== 'false';
        })(),
        retryCount: 0,
        isClient: false
    });

    const windowWidth = useWindowSize();
    const isMobile = useMemo(() => windowWidth < MOBILE_BREAKPOINT, [windowWidth]);

    const chat_title = useMemo(() => 
        conversations.find(c => c.conversation_id === conversation_id)?.chat_title || '未命名对话',
        [conversations, conversation_id]
    );

    const modelSelectorStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: isMobile ? '50%' : (state.isSidebarOpen ? '14.55rem' : '6rem'),
        transform: isMobile ? 'translateX(-50%)' : 'none'
    }), [isMobile, state.isSidebarOpen]);

    const toggleSidebar = useCallback(() => {
        setState(prev => {
            const newSidebarState = !prev.isSidebarOpen;
            Cookies.set('isSidebarOpen', String(newSidebarState), { expires: 7 });
            return { ...prev, isSidebarOpen: newSidebarState };
        });
    }, []);

    useEffect(() => {
        setState(prev => ({ ...prev, isClient: true }));
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            setState(prev => ({ ...prev, exists: false }));
            return;
        }
        if (!conversation_id || typeof conversation_id !== 'string') return;

        const checkConversationExists = async () => {
            try {
                const history = await fetchHistory({ 
                    user_id: user?.id, 
                    conversation_id, 
                    limit: 1 
                });
                setState(prev => ({ 
                    ...prev, 
                    exists: Boolean(history?.messages.length) 
                }));
            } catch (error) {
                if (state.retryCount < MAX_RETRY_COUNT) {
                    setState(prev => ({ 
                        ...prev, 
                        retryCount: prev.retryCount + 1 
                    }));
                } else {
                    setState(prev => ({ ...prev, exists: false }));
                }
            }
        };

        checkConversationExists();
    }, [conversation_id, isSignedIn, isLoaded, user?.id, state.retryCount]);

    if (state.exists === false) {
        return <NoConversationFound />;
    }

    if (!isSignedIn && isLoaded) {
        return (
            <Suspense fallback={null}>
                <SimplifiedUnauthenticatedHomePage />
            </Suspense>
        );
    }
    

    return (
        <ChatProvider initialConversationId={Array.isArray(conversation_id) ? conversation_id[0] : conversation_id}>
            <Suspense fallback={null}>
                <Meta pageName={chat_title} />
            </Suspense>
            
            <main className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {state.isClient && (
                    <>
                        {/* 侧边栏*/}
                        <motion.div
                            className="fixed top-0 left-0 h-full z-40"
                            style={{ width: SIDEBAR_WIDTH }}
                            initial={false}
                            animate={{
                                x: state.isSidebarOpen ? 0 : -SIDEBAR_WIDTH,
                            }}
                            transition={SHARED_ANIMATIONS.sidebar}
                        >
                            <MessagesSidebar onClose={toggleSidebar} />
                        </motion.div>

                        {/* 遮罩层 */}
                        {state.isSidebarOpen && isMobile && (
                            <Suspense fallback={null}>
                                <MemoizedOverlay 
                                    isOpen={true}
                                    onClose={toggleSidebar}
                                    zIndex={35}
                                />
                            </Suspense>
                        )}

                        {/* 主内容 */}
                        <motion.div
                            className="flex flex-col h-full w-full"
                            initial={false}
                            animate={{
                                marginLeft: state.isSidebarOpen && !isMobile ? SIDEBAR_WIDTH : 0
                            }}
                            transition={SHARED_ANIMATIONS.sidebar}
                        >
                            {/* 头部工具栏 */}
                            <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-[#212121] z-30">
                                <div className="flex items-center gap-3 w-full">
                                    <Suspense fallback={null}>
                                        <HomeHeaderIcon 
                                            isSidebarOpen={state.isSidebarOpen} 
                                            onOpen={toggleSidebar}
                                        />
                                    </Suspense>
                                    <Suspense fallback={null}>
                                        <div
                                            className={`flex items-center transition-all ${
                                                isMobile ? 'flex-1 justify-center' : ''
                                            }`}
                                            style={modelSelectorStyle}
                                        >
                                            <ModelSelector />
                                        </div>
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

                            {/* 底部区域 */}
                            <footer>
                                <div className="flex flex-col items-center w-full bg-transparent">
                                    <div className="w-full max-w-4xl">
                                        <Suspense fallback={null}>
                                            <ChatInputWrapper />
                                        </Suspense>
                                    </div>
                                    <div className="w-full">
                                        <Suspense fallback={null}>
                                            <CText />
                                        </Suspense>
                                    </div>
                                    <div className="mb-2" />
                                </div>
                            </footer>
                        </motion.div>

                        {/* 滚动按钮 */}
                        <Suspense fallback={null}>
                            <ScrollDownButton 
                                isSidebarOpen={state.isSidebarOpen} 
                                sidebarWidth={SIDEBAR_WIDTH} 
                            />
                        </Suspense>
                    </>
                )}
            </main>
        </ChatProvider>
    );
});

ChatPage.displayName = 'ChatPage';

export default ChatPage;
