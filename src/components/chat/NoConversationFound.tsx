"use client";

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircleX, ArrowLeft } from 'lucide-react';
import useTranslation from "@/hooks/useTranslation";
import { Button } from '@/components/ui/button';
import { SharedChatLayout } from '@/components/layouts/SharedChatLayout';

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
    }
};

const NoConversationFound = memo(() => {
    const router = useRouter();
    const { t } = useTranslation();
    
    // 自定义主内容渲染函数
    const renderMainContent = () => (
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
    );

    return (
        <SharedChatLayout
            title={t("对话不存在")}
            description={t("该对话可能已被删除或无权访问")}
            showAvatar={false}
            renderMainContent={renderMainContent}
        />
    );
});

NoConversationFound.displayName = 'NoConversationFound';

export default NoConversationFound;