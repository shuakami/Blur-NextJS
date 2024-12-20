'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {motion} from 'framer-motion';
import Cookies from 'js-cookie';
import HomeHeaderIcon from '@/app/[首页占位]/home_header_icon';
import CText from '@/app/copyright/ctext';
import {Button} from '@/components/ui/button';
import {LogIn, Sparkles, UserPlus} from 'lucide-react';
import {Skeleton} from '@/components/ui/skeleton';
import UnauthenticatedSidebar from '@/components/NoLogin/nologin_chat_sidebar';
import useTranslation from '../../hooks/i18n/useTranslation';

const SIDEBAR_WIDTH = 220; // 固定侧边栏宽度

export default function ChatPage() {
    const {t} = useTranslation();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    useEffect(() => {
        // 从 cookies 恢复侧边栏状态
        const sidebarState = Cookies.get('isSidebarOpen');
        if (sidebarState) {
            setIsSidebarOpen(sidebarState === 'true');
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => {
            const newState = !prev;
            // 存储新的侧边栏状态到 cookies
            Cookies.set('isSidebarOpen', newState.toString(), {expires: 7}); // 过期时间设置为 7 天
            return newState;
        });
    };

    // 优化动画配置
    const transitionConfig = {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
    };

    return (
        <div className="w-full h-screen flex overflow-hidden">
            {/* 侧边栏 */}
            <motion.div
                className="fixed top-0 left-0 h-full z-30 bg-gray-50 dark:bg-[#171717]"
                style={{width: SIDEBAR_WIDTH}}
                initial={false}  // 禁用初始动画
                animate={{
                    x: isSidebarOpen ? 0 : -SIDEBAR_WIDTH
                }}
                transition={transitionConfig}
            >
                <UnauthenticatedSidebar onClose={toggleSidebar}/>
            </motion.div>

            {/* 主内容区域 */}
            <motion.div
                className="flex flex-col h-full w-full overflow-hidden"
                animate={{
                    marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0
                }}
                transition={transitionConfig}
            >
                <motion.div
                    className="absolute top-4 left-4 z-40"
                    initial={false}
                    animate={{
                        opacity: isSidebarOpen ? 0 : 1,
                        scale: isSidebarOpen ? 0.8 : 1,
                    }}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut"
                    }}
                >
                    {!isSidebarOpen && (
                        <HomeHeaderIcon 
                            isSidebarOpen={isSidebarOpen} 
                            onOpen={toggleSidebar}
                        />
                    )}
                </motion.div>

                <div className="w-full h-screen flex items-center justify-center text-foreground">
                    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
                        <Sparkles className="h-16 w-16 mb-4 text-blue-500/80"/>
                        <h2 className="text-2xl font-bold mb-2">{t('我们找不到对话历史')}</h2>
                        <p className="text-muted-foreground text-sm-md mb-6">
                            {t('请先尝试登录。无论是聊天还是创作，Blur都能手到擒来。')}
                        </p>
                        <div className="space-x-4">
                            <Button variant="default"
                                    onClick={() => window.open('/login', '_blank', 'noopener,noreferrer')}>
                                <LogIn className="mr-2 h-4 w-4"/> {t('登录')}
                            </Button>
                            <Button variant="outline"
                                    onClick={() => window.open('/signup', '_blank', 'noopener,noreferrer')}>
                                <UserPlus className="mr-2 h-4 w-4"/> {t('注册')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 flex flex-col items-center w-full ">
                    <div className="w-full max-w-4xl">
                        <Skeleton className="h-12 w-full mb-2"/>
                        <CText/>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
