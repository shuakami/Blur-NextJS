"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ChatList from '@/app/[消息显示]/chat_list';
import Meta from '@/components/ui/Meta';
import { useShortcutManager } from '@/providers/ShortcutProvider'
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts';
import { useLayout } from '@/components/layouts/LayoutContext';
import { Route } from 'next';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import styles from './SharedChatLayout.module.css';
import PersistentSidebar from './PersistentSidebar';
import { useToast } from '@/hooks/ui/use-toast';
import { useConversationContext } from '@/app/[上下文]/ChatContext';
import ScrollDownButton from '@/components/ui/scroll-down-button';
import ChatInputWrapper from '@/components/ui/ChatInputWrapper';

// 动态导入非关键组件
const UserAvatar = dynamic(() => import('@/components/ui/page_right_user_avatar'), { ssr: false });
const ModelSelector = dynamic(() => import('@/components/ui/model_selector'), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });
const ConnectionStatusInner = dynamic(() => import('../ui/ConnectionStatus'), { ssr: false });
const CommandDialog = dynamic(() => import("@/components/command/command-dialog").then(mod => mod.CommandDialog), { ssr: false });
const SharePopover = dynamic(() => import('@/components/share/SharePopover').then(mod => mod.SharePopover), { ssr: false });

// 类型定义
interface SharedChatLayoutProps {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    hasConversation?: boolean;
    showAvatar?: boolean;
    onSidebarToggle?: (isOpen: boolean) => void;
    renderMainContent?: () => React.ReactNode;
    renderBottomContent?: () => React.ReactNode;
    onShare?: () => void;
    onToggleFavorite?: () => void;
    isFavorited?: boolean;
}
// 遮罩层组件
const Overlay = React.memo(({ onClose }: { onClose: () => void }) => (
    <div 
        className="fixed inset-0 bg-black/40 cursor-pointer
        transition-all duration-300 ease-in-out"
        onClick={onClose}
    />
));

Overlay.displayName = 'Overlay';

export function SharedChatLayout({
    title,
    description,
    hasConversation,
    showAvatar = true, 
    onSidebarToggle,
    renderMainContent,
    renderBottomContent,
    onShare,
    onToggleFavorite,
    isFavorited
}: SharedChatLayoutProps) {
    const router = useRouter();
    const { isSidebarOpen, toggleSidebar, isMobile } = useLayout();
    const shortcutManager = useShortcutManager();
    const [isCommandOpen, setIsCommandOpen] = React.useState(false);
    const { toast } = useToast();
    const { isConversationPage, conversationId } = useConversationContext();

    // 默认的分享处理函数
    const defaultShare = React.useCallback(async () => {
        if (!conversationId) return;
        
        try {
            await navigator.clipboard.writeText(
                `${window.location.origin}/chat/${conversationId}`
            );
            toast({
                title: "链接已复制",
                description: "对话链接已复制到剪贴板",
                duration: 3000,
            });
        } catch (err) {
            toast({
                title: "复制失败",
                description: "无法复制链接，请手动复制",
                variant: "destructive",
                duration: 3000,
            });
        }
    }, [conversationId, toast]);

    // 默认的收藏处理函数
    const [defaultIsFavorited, setDefaultIsFavorited] = React.useState(false);
    const defaultToggleFavorite = React.useCallback(() => {
        setDefaultIsFavorited(prev => !prev);
        toast({
            title: defaultIsFavorited ? "已取消收藏" : "已添加收藏",
            description: defaultIsFavorited ? "对话已从收藏夹中移除" : "对话已添加到收藏夹",
            duration: 3000,
        });
    }, [defaultIsFavorited, toast]);

    useEffect(() => {
        onSidebarToggle?.(isSidebarOpen);
    }, [isSidebarOpen, onSidebarToggle]);

    useEffect(() => {
        // 注册快捷键
        shortcutManager.register({
            command: 'TOGGLE_SIDEBAR',
            key: SHORTCUTS.TOGGLE_SIDEBAR,
            description: SHORTCUT_DESCRIPTIONS.TOGGLE_SIDEBAR,
            handler: toggleSidebar,
            condition: () => !isMobile || document.activeElement?.tagName !== 'INPUT'
        });

        shortcutManager.register({
            command: 'NEW_CHAT',
            key: SHORTCUTS.NEW_CHAT,
            description: SHORTCUT_DESCRIPTIONS.NEW_CHAT,
            handler: () => router.push('/?new=true' as Route),
            condition: () => document.activeElement?.tagName !== 'INPUT'
        });

        shortcutManager.register({
            command: 'TOGGLE_COMMAND_CENTER',
            key: SHORTCUTS.TOGGLE_COMMAND_CENTER,
            description: SHORTCUT_DESCRIPTIONS.TOGGLE_COMMAND_CENTER,
            handler: () => setIsCommandOpen(true),
            condition: () => document.activeElement?.tagName !== 'INPUT'
        });

        return () => {
            shortcutManager.unregister('TOGGLE_SIDEBAR');
            shortcutManager.unregister('NEW_CHAT');
            shortcutManager.unregister('TOGGLE_COMMAND_CENTER');
        };
    }, [shortcutManager, toggleSidebar, router, isMobile]);

    return (
        <>
            <CommandDialog 
                open={isCommandOpen} 
                onOpenChange={setIsCommandOpen}
            />
            <Meta
                pageName={title}
                pageDescription={description}
            />
            <div 
                className={`${styles.root} w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]`}
                data-sidebar={isSidebarOpen}
                data-mobile={isMobile}
            >
                {/* 侧边栏占位 */}
                <div className={`${styles['sidebar-placeholder']} flex-shrink-0 transition-[width] duration-300 ease-in-out`} />
                <PersistentSidebar />
                {/* 主内容区 */}
                <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden">
                    {/* 头部工具栏 */}
                    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-2.5 bg-white dark:bg-[#212121] z-30">
                        <div className="flex items-center gap-3 w-full">
                            <HomeHeaderIcon 
                                isSidebarOpen={isSidebarOpen} 
                                onOpen={toggleSidebar}
                            />
                            <div className={`${styles['model-selector-wrapper']} flex items-center absolute`}>
                                <ModelSelector />
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                                {/* 分享按钮 */}
                                {isConversationPage && (
                                    <SharePopover onShare={onShare || defaultShare} />
                                )}
                                {/* 收藏按钮 */}
                                {isConversationPage && (
                                    <button
                                        onClick={onToggleFavorite || defaultToggleFavorite}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200
                                        text-gray-700 dark:text-gray-300"
                                        title={(onToggleFavorite ? isFavorited : defaultIsFavorited) ? "取消收藏" : "收藏对话"}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" 
                                            fill={(onToggleFavorite ? isFavorited : defaultIsFavorited) ? "currentColor" : "none"} 
                                            stroke="currentColor" strokeWidth={(onToggleFavorite ? isFavorited : defaultIsFavorited) ? "0" : "1.5"}>
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                )}
                                {showAvatar && (
                                    <div className="p-2 rounded-lg">
                                            <UserAvatar />
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* 主要内容 */}
                    {renderMainContent?.() || (
                        <div className="flex-1 flex flex-col w-full pt-12">
                            <div className={`flex-1 overflow-auto ${styles['scroll-container']}`}>
                                <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                    <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]">
                                        <ChatList />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 底部内容 */}
                    {renderBottomContent?.() || (hasConversation && (
                        <div className="flex flex-col items-center w-full bg-transparent">
                            <div className="w-full max-w-4xl px-3 md:px-0">
                                <ChatInputWrapper />
                            </div>
                            <CText />
                            <div className="mb-3"/>
                        </div>
                    ))}

                    {/* 连接状态 */}
                    <div className="fixed md:right-4 md:bottom-4 hidden md:block">
                        <ConnectionStatusInner />
                    </div>
                </div>

                <ScrollDownButton
                    isSidebarOpen={isSidebarOpen} 
                    sidebarWidth={220}
                />
            </div>
        </>
    );
}

export type { SharedChatLayoutProps };