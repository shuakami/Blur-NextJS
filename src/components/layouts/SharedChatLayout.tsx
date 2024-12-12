"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Meta from '@/components/ui/Meta';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import ConnectionStatus from '../ui/ConnectionStatus';
import { useShortcutManager } from '@/providers/ShortcutProvider'
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts';
import { CommandDialog } from "@/components/command/command-dialog"
import { useLayout } from '@/components/layouts/LayoutContext';
import { Route } from 'next';

// 动态导入非关键组件
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), { ssr: false });
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), { ssr: false });
const UserAvatar = dynamic(() => import('@/components/ui/page_right_user_avatar'), { ssr: false });
const ModelSelector = dynamic(() => import('@/components/ui/model_selector'), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });
const ScrollDownButton = dynamic(() => import('@/components/ui/scroll-down-button'), { ssr: false });

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
}
// 遮罩层组件
const Overlay = React.memo(({ onClose }: { onClose: () => void }) => (
    <div 
        className="fixed inset-0 bg-black/40 cursor-pointer
        transition-opacity duration-300 ease-in-out"
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
    renderBottomContent
}: SharedChatLayoutProps) {
    const router = useRouter();
    const { isSidebarOpen, toggleSidebar, isMobile } = useLayout();
    const shortcutManager = useShortcutManager();
    const [isCommandOpen, setIsCommandOpen] = React.useState(false);

    useEffect(() => {
        // 通知父组件侧边栏状态变化
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
            <div className="w-full h-[100dvh] flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {/* 侧边栏 */}
                <div className={`
                    fixed top-0 left-0 h-[100dvh] z-50 w-[220px]
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[220px]'}
                `}>
                    <MessagesSidebar onClose={toggleSidebar} />
                </div>

                {/* 移动端遮罩 */}
                {isMobile && isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/40 cursor-pointer z-40
                        transition-opacity duration-300 ease-in-out"
                        onClick={toggleSidebar}
                    />
                )}

                {/* 主内容区 */}
                <div className={`
                    w-full flex flex-col relative
                    ${isSidebarOpen && !isMobile ? 'ml-[220px]' : 'ml-0'}
                `}>
                    {/* 头部工具栏 */}
                    <header className="flex-none bg-white dark:bg-[#212121] z-30 px-4 py-2.5">
                        <div className="flex items-center gap-3 w-full">
                            <HomeHeaderIcon 
                                isSidebarOpen={isSidebarOpen} 
                                onOpen={toggleSidebar}
                            />
                            <div className={`
                                flex items-center
                                ${isMobile ? 'flex-1 justify-center' : ''}
                                absolute
                                ${isMobile ? 'left-1/2 -translate-x-1/2' : isSidebarOpen ? 'left-[14.5rem]' : 'left-24'}
                            `}>
                                <ModelSelector />
                            </div>
                            {showAvatar && (
                                <div className="ml-auto">
                                    <UserAvatar />
                                </div>
                            )}
                        </div>
                    </header>

                    {/* 主要内容 */}
                    {renderMainContent?.() || (
                        <div className="flex-1 min-h-0">
                            <div className="h-full overflow-auto scroll-container">
                                <div className="py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                    <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]">
                                        <ChatList />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 底部内容 */}
                    {renderBottomContent?.() || (hasConversation && (
                        <div className="flex-none bg-transparent">
                            <div className="w-full max-w-4xl px-3 md:px-0 mx-auto">
                                <ChatInputWrapper />
                            </div>
                            <CText />
                            <div className="h-3" />
                        </div>
                    ))}

                    {/* 连接状态 */}
                    <div className="fixed md:right-4 md:bottom-4 hidden md:block">
                        <ConnectionStatus />
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