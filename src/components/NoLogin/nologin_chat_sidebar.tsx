'use client';

import React from 'react';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {motion} from 'framer-motion';
import {MessageCirclePlus, SidebarCloseIcon} from 'lucide-react';
import {useRouter} from 'next/navigation';
import useTranslation from '@/hooks/useTranslation';

interface UnauthenticatedSidebarProps {
    onClose: () => void;
}

export default function UnauthenticatedSidebar({onClose}: UnauthenticatedSidebarProps) {
    const {t} = useTranslation();
    const router = useRouter();
    const onLogin = () => {
        window.open('/login', '_blank', 'noopener,noreferrer');
    };

    const onRegister = () => {
        window.open('/signup', '_blank', 'noopener,noreferrer');
    };

    const onNewChat = () => {
        router.push('/?new=true');
    };

    return (
        <div className="flex flex-col h-screen w-[220px] bg-[#F9F9F9]/65 dark:bg-[#171717] text-black dark:text-white">
            <ScrollArea className="flex-grow">
                <div className="flex space-x-3 mt-[12px] w-44 justify-center items-center mx-4">
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={onClose}
                    >
                        <SidebarCloseIcon size={20} className="text-black dark:text-white"/>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-1/2 text-black dark:text-white bg-black/10 dark:bg-white/10 hover:bg-[#f0f0f0] dark:hover:bg-[#212121] flex items-center justify-center"
                        onClick={onNewChat}
                    >
                        <MessageCirclePlus size={20} className="text-black dark:text-white"/>
                    </Button>
                </div>

                <div className="py-4 mt-2">
                    <motion.div
                        className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.3}}
                    >
                        {t('登录后可查看历史记录')}
                    </motion.div>
                </div>
            </ScrollArea>

            <div className="p-4">
                <div className="text-start">
                    <h3 className="font-bold text-lg mb-2">{t('登录以继续?')}</h3>
                    <p className="text-sm text-black/60 dark:text-[#9CA3AF] mb-4">
                        {t('享受无限量的历史记录')}
                    </p>
                    <div className="space-y-2">
                        <Button
                            className="w-full bg-gradient-to-r text-primary-foreground hover:bg-primary/90"
                            onClick={onLogin}
                        >
                            {t('登录')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full bg-background text-foreground"
                            onClick={onRegister}
                        >
                            {t('注册')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
