"use client";

import React, { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircleX, ArrowLeft } from 'lucide-react';
import useTranslation from "@/hooks/useTranslation";
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import CText from '@/app/copyright/ctext';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';

const SIDEBAR_WIDTH = 220;

const ANIMATION_CONFIG = {
    icon: {
        animate: { 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1.1, 1]
        },
        transition: { 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
        }
    },
    sidebar: {
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.8,
        duration: 0.5
    }
};

const NoConversationFound = memo(() => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    useEffect(() => {
        const sidebarState = Cookies.get('isSidebarOpen');
        if (sidebarState) {
            setIsSidebarOpen(sidebarState === 'true');
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            Cookies.set('isSidebarOpen', String(newState), { expires: 7 });
            return newState;
        });
    };
    
    return (
        <div className="w-full h-screen flex overflow-hidden bg-white dark:bg-gray-950">
            {/* 侧边栏 */}
            <motion.div
                className="fixed top-0 left-0 h-full z-40"
                style={{ width: SIDEBAR_WIDTH }}
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH,
                }}
                transition={ANIMATION_CONFIG.sidebar}
            >
                <MessagesSidebar onClose={toggleSidebar} />
            </motion.div>

            {/* 主内容区域 */}
            <motion.div
                className="flex flex-col h-full w-full"
                initial={false}
                animate={{
                    marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0
                }}
                transition={ANIMATION_CONFIG.sidebar}
            >
                {/* 头部工具栏 */}
                <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-3 z-30">
                    <HomeHeaderIcon 
                        isSidebarOpen={isSidebarOpen} 
                        onOpen={toggleSidebar}
                    />
                </header>

                {/* 调整后的主内容布局 */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-16 w-full max-w-[720px] mx-auto px-8">
                        {/* 左侧图标 */}
                        <div className="flex-shrink-0 w-[128px] flex justify-center">
                            <motion.div
                                className="relative p-6 rounded-full
                                         bg-gradient-to-br from-gray-50 to-gray-100/50 
                                         dark:from-gray-800 dark:to-gray-900/50"
                                {...ANIMATION_CONFIG.icon}
                            >
                                <MessageCircleX className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                            </motion.div>
                        </div>

                        {/* 右侧内容 */}
                        <div className="flex-1 max-w-[420px]">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                        {t("对话不存在")}
                                    </h2>
                                    <p className="mt-2.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {t("该对话可能已被删除或无权访问，您可以返回首页开始新的对话")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="default"
                                        className="h-11 px-6 text-sm font-medium
                                                 bg-gray-900 hover:bg-gray-800 
                                                 dark:bg-white dark:hover:bg-gray-50
                                                 transition-colors duration-200"
                                        onClick={() => router.push('/?new=')}
                                    >
                                        {t("返回首页")}
                                    </Button>
                                    
                                    <Button
                                        variant="ghost"
                                        className="h-11 px-6 text-sm font-medium
                                                 text-gray-600 hover:text-gray-900 
                                                 dark:text-gray-400 dark:hover:text-gray-100"
                                        onClick={() => router.back()}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t("返回上一页")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 底部版权信息 */}
                <footer className="flex justify-center mb-4">
                    <CText />
                </footer>
            </motion.div>
        </div>
    );
});

NoConversationFound.displayName = 'NoConversationFound';

export default NoConversationFound;