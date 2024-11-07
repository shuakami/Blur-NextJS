"use client";

import React, { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import { ChatProvider, useChatContext } from '@/app/[上下文]/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { ConversationsProvider } from "../../contexts/ConversationsContext";
import dynamic from 'next/dynamic';

const MessagesSidebar = dynamic(() => import('@/app/[侧边栏管理]/messages_sidebar'), { ssr: false });
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), { ssr: false });
const UserAvatar = dynamic(() => import('@/components/ui/page_right_user_avatar'), { ssr: false });
const HomepageContent = dynamic(() => import("@/app/[首页占位]/home-content"), { ssr: false });
const ModelSelector = dynamic(() => import("@/components/ui/model_selector").then(mod => mod.default), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });
const HomeHeaderIcon = dynamic(() => import('./[首页占位]/home_header_icon').then(mod => mod.default), { ssr: false });

const SIDEBAR_WIDTH = 220;

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

const SidebarOverlay = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className="fixed inset-0 bg-black/40 z-30 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
        )}
    </AnimatePresence>
));
SidebarOverlay.displayName = 'SidebarOverlay';

const fadeInUpAnimation = {
    initial: { opacity: 0},
    animate: { opacity: 1},
    exit: { opacity: 0},
    transition: { duration: 0.3, ease: "easeOut" }
};

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
        if (!newConversationId) return;
        
        window.history.replaceState(
            { conversationId: newConversationId }, 
            '', 
            `/chat/${newConversationId}`
        );
        
        requestAnimationFrame(() => {
            setHasConversation(true);
            resetNewConversationId();
        });
    }, [newConversationId, resetNewConversationId]);

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
        <div className="w-full h-screen flex overflow-hidden relative">
            {isClient && (
                <>
                    <motion.div
                        className="h-full z-40 fixed top-0 left-0 bg-white dark:bg-gray-900"
                        style={{ width: SIDEBAR_WIDTH }}
                        initial={{ x: -SIDEBAR_WIDTH }}
                        animate={{ x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH }}
                        transition={sidebarAnimationConfig}
                    >
                        <Suspense fallback={null}>
                            <MessagesSidebar onClose={toggleSidebar} />
                        </Suspense>
                    </motion.div>

                    <SidebarOverlay isOpen={isSidebarOpen && isMobile} onClose={toggleSidebar} />

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
                        <div className="flex justify-between items-center px-4 py-4 absolute top-0 left-0 w-full">
                            <div className={`flex items-center ${isMobile ? '' : 'space-x-4'}`}>
                                <motion.div
                                    className={`absolute top-4 ${isMobile ? '' : 'left-4'} z-40`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <HomeHeaderIcon isSidebarOpen={isSidebarOpen} onOpen={toggleSidebar} />
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
                                        <ModelSelector />
                                    </motion.div>
                                </Suspense>
                            </div>
                            <Suspense fallback={null}>
                                <UserAvatar />
                            </Suspense>
                        </div>

                        <AnimatePresence mode="wait">
                            {hasConversation ? (
                                <motion.div 
                                    key="conversation"
                                    className="flex-1 overflow-auto w-full mt-12"
                                    {...fadeInUpAnimation}
                                >
                                    <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                        <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-3xl">
                                            <Suspense fallback={null}>
                                                <ChatList />
                                            </Suspense>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="homepage"
                                    className="flex justify-center items-center h-full"
                                    {...fadeInUpAnimation}
                                >
                                    <Suspense fallback={null}>
                                        <HomepageContent 
                                            onFirstMessage={() => setHasConversation(true)}
                                        />
                                    </Suspense>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
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
                                        <ChatInputWrapper 
                                            onFirstMessage={() => setHasConversation(true)} 
                                        />
                                    </div>
                                    <Suspense fallback={null}>
                                        <CText />
                                    </Suspense>
                                    <div className="mb-3"/>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </div>
    );
};
HomeContent.displayName = 'HomeContent';

export default function Home() {
    return (
        <ConversationsProvider>
            <ChatProvider>
                <HomeContent />
            </ChatProvider>
        </ConversationsProvider>
    );
}