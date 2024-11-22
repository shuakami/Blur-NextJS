"use client";

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import Meta from '@/components/ui/Meta';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import ConnectionStatus from '../ui/ConnectionStatus';

// 动态导入非关键组件
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), { ssr: false });
const ChatList = dynamic(() => import('@/app/[消息显示]/chat_list'), { ssr: false });
const UserAvatar = dynamic(() => import('@/components/ui/page_right_user_avatar'), { ssr: false });
const ModelSelector = dynamic(() => import('@/components/ui/model_selector'), { ssr: false });
const CText = dynamic(() => import('@/app/copyright/ctext'), { ssr: false });
const ScrollDownButton = dynamic(() => import('@/components/ui/scroll-down-button'), { ssr: false });

// 常量配置
const MOBILE_BREAKPOINT = 768;

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 初始化响应式状态
    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = document.documentElement.clientWidth < MOBILE_BREAKPOINT;
            setIsMobile(isMobileView);
            
            // 如果是移动端，强制关闭侧边栏
            if (isMobileView) {
                setIsSidebarOpen(false);
            } else {
                // PC端则读取存储的状态
                setIsSidebarOpen(Cookies.get('isSidebarOpen') === 'true');
            }
        };
        
        checkMobile();
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(checkMobile);
        });
        
        resizeObserver.observe(document.documentElement);
        return () => resizeObserver.disconnect();
    }, []);

    // 修改侧边栏切换逻辑
    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            // 只在PC端保存状态
            if (!isMobile) {
                Cookies.set('isSidebarOpen', String(newState));
            }
            onSidebarToggle?.(newState);
            return newState;
        });
    }, [isMobile, onSidebarToggle]);

    return (
        <>
            <Meta
                pageName={title}
                pageDescription={description}
            />
            <div className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
                {/* 侧边栏 */}
                <div className={`
                    fixed top-0 left-0 h-full z-50 w-[220px]
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[220px]'}
                `}>
                    <MessagesSidebar onClose={toggleSidebar} />
                </div>

                {/* 移动端遮罩 */}
                {isMobile && (
                    <div className={`fixed inset-0 bg-black/40 cursor-pointer z-40
                        transition-opacity duration-300 ease-in-out
                        ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={toggleSidebar}
                    />
                )}

                {/* 主内容区 */}
                <div className={`
                    flex flex-col h-full w-full overflow-hidden
                    transition-[margin] duration-300 ease-in-out
                    ${isSidebarOpen && !isMobile ? 'ml-[220px]' : 'ml-0'}
                `}>
                    {/* 头部工具栏 */}
                    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-[#212121] z-30">
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
                        <div className="flex-1 overflow-auto w-full pt-12">
                            <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                                <div className="mx-auto flex flex-1 gap-4 md:gap-5 lg:gap-6 md:max-w-[49.5rem]">
                                    <ChatList />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 底部内容 */}
                    {renderBottomContent?.() || (hasConversation && (
                        <div className="flex flex-col items-center w-full bg-transparent">
                            <div className="w-full max-w-4xl">
                                <ChatInputWrapper />
                            </div>
                            <CText />
                            <div className="mb-3"/>
                        </div>
                    ))}

                    {/* 连接状态 */}
                    <ConnectionStatus />
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