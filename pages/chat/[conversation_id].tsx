"use client";

import React, { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from "js-cookie";
import { ChatProvider } from "@/app/[上下文]/ChatContext";
import dynamic from 'next/dynamic';
import { fetchHistory } from '@/app/[拉取历史]/fetch_history';
import { useConversations } from '../../contexts/ConversationsContext';

// 动态导入组件
const MessagesSidebar = dynamic(() => import('@/app/[侧边栏管理]/messages_sidebar'), { ssr: false });
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), { ssr: false });
const HomePageLoading = dynamic(() => import("@/components/Loading/loading_converdation_page"), { ssr: false });
const SimplifiedUnauthenticatedHomePage = dynamic(() => import("@/components/NoLogin/nologin_home"), { ssr: false });
const Meta = dynamic(() => import("@/components/ui/Meta"), { ssr: false });
const ModelSelector = dynamic(() => import("@/components/ui/model_selector").then(mod => mod.default), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });
const HomeHeaderIcon = dynamic(() => import('@/app/[首页占位]/home_header_icon').then(mod => mod.default), { ssr: false });

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

const SidebarOverlay = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className="fixed inset-0 z-30 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
        )}
    </AnimatePresence>
));

SidebarOverlay.displayName = 'SidebarOverlay';

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
        top: isMobile ? '1rem' : '16.7px',
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

    if (!isFullyLoaded || !isLoaded) {
        return <HomePageLoading/>;
    }
    
    if (!isSignedIn) {
        return <SimplifiedUnauthenticatedHomePage/>;
    }

    if (exists === false && isSignedIn) {
        router.replace('/');
        return <HomePageLoading/>;
    }

    if (!conversation_id || typeof conversation_id !== 'string') {
        return <HomePageLoading/>;
    }

    return (
        <ChatProvider initialConversationId={conversation_id}>
         <Meta pageName={chat_title}/> 
            <div className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {isClient && (
                    <>
                        <motion.div
                            className="h-full z-40 fixed top-0 left-0"
                            style={{ width: SIDEBAR_WIDTH }}
                            initial={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                            animate={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                            transition={sidebarAnimationConfig}
                        >
                            <Suspense fallback={null}>
                                <MessagesSidebar onClose={toggleSidebar}/>
                            </Suspense>
                        </motion.div>

                        <SidebarOverlay isOpen={isSidebarOpen && isMobile} onClose={toggleSidebar}/>

                        <motion.div
                            className="flex flex-col h-full overflow-hidden w-full"
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
                            <div className="flex justify-between items-center px-4 py-4 absolute top-0 left-0 w-full">
                                <div className={`flex items-center ${isMobile ? '' : 'space-x-4'}`}>
                                    <motion.div
                                        className={`absolute top-4 ${isMobile ? '' : 'left-4'} z-40`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <HomeHeaderIcon isSidebarOpen={isSidebarOpen} onOpen={toggleSidebar}/>
                                    </motion.div>
                                    <Suspense fallback={null}>
                                        <motion.div
                                            className="absolute z-30 md:top-[16.7]"
                                            style={modelSelectorStyle}
                                            initial={false}
                                            animate={{
                                                left: isMobile 
                                                    ? '50%' 
                                                    : isSidebarOpen 
                                                        ? '13.5rem' 
                                                        : '6rem',
                                                transform: isMobile 
                                                    ? 'translateX(-50%)' 
                                                    : 'translateX(0)',
                                            }}
                                            transition={{
                                                duration: 0.45,
                                                ease: [0.25, 0.8, 0.25, 1],
                                            }}
                                        >
                                            <ModelSelector/>
                                        </motion.div>
                                    </Suspense>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto w-full mt-12">
                                <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                    <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-3xl">
                                        <Suspense fallback={null}>
                                            <ChatList />
                                        </Suspense>
                                    </div>
                                </div>
                            </div>

                            <motion.div layout>
                                <div className="flex flex-col items-center w-full bg-transparent">
                                    <div className="w-full max-w-4xl">
                                        <ChatInputWrapper/>
                                    </div>
                                    <motion.div 
                                        className="w-full"
                                        initial={{ opacity: 0, height: "24px" }}
                                        animate={{ opacity: 1, height: "24px" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Suspense fallback={
                                            <div className="h-[24px] flex items-center justify-center opacity-0">
                                                <div className="text-xs text-black/60 dark:text-[#b2b2b2]/90">占位文本</div>
                                            </div>
                                        }>
                                            <CText />
                                        </Suspense>
                                    </motion.div>
                                    <div className="mb-3"/>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </div>
        </ChatProvider>
    );
}
ChatPage.displayName = 'ChatPage';