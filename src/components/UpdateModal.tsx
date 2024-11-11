"use client";

import { Dialog, DialogBackdrop } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo, createElement } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { ChatList } from '@/components/ui/chat-list';
import LoadingDemo from "./ui/Update_content/LoadingDemo";
import AnimationDemo from "./ui/Update_content/AnimationDemo";
import { memo } from 'react';

// 只保留必要的动画配置
const animations = {
    modal: {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.95, opacity: 0 },
        transition: { type: "spring", duration: 0.5, bounce: 0.3 }
    }
};

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Demo 组件类型定义
type DemoComponent = React.FC;

// Feature 接口定义
interface Feature {
    title: string;
    description: string;
    Demo: DemoComponent;
}

const UpdateModal: React.FC<UpdateModalProps> = memo(({ isOpen, onClose }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const features = useMemo<Feature[]>(() => [
        {
            title: "消息编辑功能（待实装）",
            description: "轻松修改已发送的消息，让沟通更加灵活自如",
            Demo: memo(function MessageEditDemo() {
                return (
                    <motion.div 
                        className="w-full h-[200px] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-full max-w-[320px]">
                            <ChatList 
                                demo={true}
                                messages={[
                                    {
                                        id: 'demo-message',
                                        content: '这是一条示例消息',
                                        type: 'user'
                                    }
                                ]}
                            />
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400"
                            >
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    悬停消息显示编辑按钮
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            }),
        },
        {
            title: "全新界面体验",
            description: "我们优化了整体视觉效果，更加紧凑的布局，更加细致的动画",
            Demo: memo(function UIDemo() {
                return (
                    <motion.div 
                        className="w-full h-[200px] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-full max-w-[320px] space-y-3">
                            <motion.div 
                                className="space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="h-8 w-full rounded-lg bg-gray-100 dark:bg-gray-800" />
                                <div className="flex gap-2">
                                    <div className="h-16 w-1/3 rounded-lg bg-gray-100 dark:bg-gray-800" />
                                    <motion.div 
                                        className="h-16 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800"
                                        animate={{ 
                                            boxShadow: [
                                                "0 0 0 rgba(0,0,0,0)",
                                                "0 2px 8px rgba(0,0,0,0.1)",
                                                "0 0 0 rgba(0,0,0,0)"
                                            ]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            }),
        },
        {
            title: "优化加载速度",
            description: "得益于全新的性能优化方案，让页面加载速度平均提升20%~40%",
            Demo: memo(function LoadingSpeedDemo() {
                return (
                    <motion.div 
                        className="w-full h-[200px] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <LoadingDemo />
                    </motion.div>
                );
            }),
        },
        {
            title: "动画优化",
            description: "我们优化了动画效果，让页面更加流畅",
            Demo: memo(function AnimationSpeedDemo() {
                return (
                    <div className="flex items-center justify-center">
                        <AnimationDemo />
                    </div>
                );
            }),
        },
    ], []);

    // 为每个 Demo 组件添加 displayName
    features[0].Demo.displayName = 'MessageEditDemo';
    features[1].Demo.displayName = 'UIDemo';
    features[2].Demo.displayName = 'LoadingSpeedDemo';
    features[3].Demo.displayName = 'AnimationSpeedDemo';

    const changePage = useCallback((newPage: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentPage(newPage);
            setIsTransitioning(false);
        }, 300); // 匹配 CSS transition 时间
    }, []);

    const nextPage = useCallback(() => {
        if (currentPage < features.length - 1) {
            changePage(currentPage + 1);
        } else {
            onClose();
        }
    }, [currentPage, features.length, onClose, changePage]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            changePage(currentPage - 1);
        }
    }, [currentPage, changePage]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center outline-none"
        >
            {/* 背景遮罩 */}
            <div 
                className={`fixed inset-0 transition-opacity duration-300 ease-out
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                    bg-black/50`}
                onClick={onClose}
            />
            
            {/* 模态框主体  */}
            <motion.div
                {...animations.modal}
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl 
                          w-[calc(100%-2rem)] md:w-full max-w-3xl overflow-hidden 
                          max-h-[90vh] md:max-h-[85vh]"
            >
                {/* 关闭按钮 */}
                <button 
                    onClick={onClose}
                    className="absolute right-3 top-3 md:right-4 md:top-4 p-2 rounded-full 
                             hover:bg-gray-100 dark:hover:bg-gray-800 z-10
                             transition-colors duration-200"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className="flex flex-col h-full md:flex-row md:items-stretch">
                    {/* Demo 部分 */}
                    <div className="w-full h-[180px] md:h-auto md:w-[400px] 
                                  bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center relative">
                        <div
                            className={`w-full transition-all duration-300 ease-out
                                ${isTransitioning ? 'opacity-0 translate-x-20' : 'opacity-100 translate-x-0'}`}
                        >
                            {createElement(features[currentPage].Demo)}
                        </div>
                    </div>

                    {/* 内容部分 */}
                    <div className="flex-1 px-4 py-5 md:px-8 md:py-[27px]">
                        <div className="h-full flex flex-col">
                            {/* 标题部分 */}
                            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
                                <span className="text-gray-650 dark:text-gray-300">Blur</span>
                                <span className="text-gray-500 dark:text-gray-500 font-light mx-2">/</span>
                                <span className="text-gray-900 dark:text-white font-semibold">Update</span>
                            </h2>
                            
                            {/* 特性内容 */}
                            <div className="flex-1 space-y-3 md:space-y-4">
                                <div 
                                    className={`transition-all duration-300 ease-out
                                        ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                                >
                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                                        <span className="inline-block bg-gradient-to-r from-[#eecd8c] via-[#dbaf74] to-[#dda357] 
                                            bg-clip-text text-transparent bg-300% animate-gradient">
                                            {features[currentPage].title}
                                        </span>
                                    </h3>
                                    
                                    <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400 mt-3">
                                        {features[currentPage].description}
                                    </p>
                                </div>
                            </div>

                            {/* 导航部分 */}
                            <div className="flex items-center gap-3 md:gap-4 pt-4 md:pt-6">
                                <div className="flex gap-1.5">
                                    {features.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200
                                                ${idx === currentPage 
                                                    ? 'bg-gray-900 dark:bg-white' 
                                                    : 'bg-gray-200 dark:bg-gray-700'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex-1" />
                                <button
                                    onClick={prevPage}
                                    className={`p-1.5 md:p-2 rounded-lg transition-colors duration-200
                                        ${currentPage === 0 
                                            ? 'opacity-30 cursor-not-allowed' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    disabled={currentPage === 0}
                                >
                                    <IconChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button
                                    onClick={nextPage}
                                    className="p-1.5 md:p-2 rounded-lg transition-colors duration-200
                                             hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <IconChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Dialog>
    );
});

UpdateModal.displayName = 'UpdateModal';

export default UpdateModal;