import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Monitor, Shirt, Mail, Code, PenTool, FileText, Lightbulb, Briefcase, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatInputWrapper from '@/components/ui/ChatInputWrapper'

interface HomepageContentProps {
    onFirstMessage?: () => void;
}

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

// 静态数据
const SUGGESTIONS = [
    { icon: <Monitor size={16}/>, title: '解释怀旧情怀', subtitle: '给一个幼儿园孩子听' },
    { icon: <Shirt size={16}/>, title: '帮我挑选', subtitle: '一套非常上镜的服装' },
    { icon: <Mail size={16}/>, title: '写一封电子邮件', subtitle: '向当地的水管工问询报价' },
    { icon: <Code size={16}/>, title: '编写一个 Python 脚本', subtitle: '用于自动发送每日电子邮件报告' },
] as const;

const CATEGORIES = [
    { icon: <Code size={16}/>, title: '代码', color: 'rgb(108, 113, 255)' },
    { icon: <PenTool size={16}/>, title: '写作', color: 'rgb(203, 139, 208)' },
    { icon: <FileText size={16}/>, title: '总结', color: 'rgb(234, 132, 68)' },
    { icon: <Lightbulb size={16}/>, title: '构思', color: 'rgb(226, 197, 65)' },
    { icon: <Briefcase size={16}/>, title: '建议', color: 'rgb(118, 208, 235)' },
] as const;

const TARGET_TEXT = '今天想聊点什么？';
const RANDOM_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export default function HomepageContent({onFirstMessage}: HomepageContentProps) {
    const [title, setTitle] = useState('');
    const [animationDone, setAnimationDone] = useState(false);
    const windowWidth = useWindowSize();
    const isMobile = useMemo(() => windowWidth < 1020, [windowWidth]);

    const randomChar = useCallback(() => 
        RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)],
    []);

    // 优化乱码效果
    useEffect(() => {
        let index = 0;
        let stabilityCounter = 0;
        const maxStability = 3;
        
        const interval = setInterval(() => {
            setTitle(prev => {
                let newTitle = '';
                for (let i = 0; i < TARGET_TEXT.length; i++) {
                    if (i < index) {
                        newTitle += TARGET_TEXT[i];
                    } else if (i === index) {
                        newTitle += stabilityCounter < maxStability ? 
                            randomChar() : TARGET_TEXT[i];
                    } else {
                        newTitle += ' ';
                    }
                }
                return newTitle;
            });

            stabilityCounter++;
            if (stabilityCounter > maxStability) {
                stabilityCounter = 0;
                index++;
            }

            if (index > TARGET_TEXT.length) {
                clearInterval(interval);
                setTimeout(() => setAnimationDone(true), 500);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [randomChar]);

    const categoryVariants = useMemo(() => ({
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    }), []);

    return (
        <div className="mx-auto flex h-full w-full flex-col text-base lg:justify-center md:max-w-3xl">
            <div className="mb-7 hidden text-center lg:block">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative inline-flex justify-center text-center text-2xl font-semibold leading-9">
                        <h1 className="text-2xl font-semibold mb-5">{title}</h1>
                    </div>
                </motion.div>
            </div>

            <div className="justify-end lg:justify-center flex h-full flex-shrink flex-col items-center overflow-y-hidden text-token-text-primary lg:hidden">
                <div className="flex sm:items-center md:flex-1 flex-shrink-0">
                    <h1 className="text-2xl font-semibold mb-3">{title}</h1>
                </div>
                
                <div className="mb-24 w-full flex-shrink overflow-y-hidden">
                    <div className="w-full mb-6 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:mt-16 md:mt-0">
                            {SUGGESTIONS.map((suggestion, index) => (
                                <div key={index} 
                                    className="bg-white dark:bg-gray-900 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
                                            border border-gray-100 dark:border-gray-700 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="text-primary">
                                            {React.cloneElement(suggestion.icon, { size: 18 })}
                                        </div>
                                        <div className="flex-1 mx-2">
                                            <div className="font-medium mb-1">{suggestion.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {suggestion.subtitle}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-full">
                <div className={`w-full ${isMobile ? 'fixed bottom-0 left-0 pb-4 pt-2 bg-gradient-to-t from-white dark:from-gray-900 to-transparent' : ''}`}>
                    <div className="mx-auto max-w-3xl px-4">
                        <ChatInputWrapper onFirstMessage={onFirstMessage}/>
                    </div>
                </div>
                
                <AnimatePresence>
                    {animationDone && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                                opacity: 1, 
                                height: "auto",
                                transition: {
                                    height: {
                                        duration: 0.4,
                                        ease: [0.25, 0.8, 0.25, 1]
                                    },
                                    opacity: {
                                        duration: 0.3,
                                        delay: 0.1
                                    }
                                }
                            }}
                            exit={{ opacity: 0, height: 0 }}
                            className="hidden lg:block overflow-hidden"
                        >
                            <div className="mt-12 max-w-3xl mx-auto">
                                <motion.nav
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: { 
                                            opacity: 1,
                                            transition: { 
                                                staggerChildren: 0.05,
                                                ease: [0.25, 0.8, 0.25, 1]
                                            } 
                                        },
                                    }}
                                    className="flex flex-wrap justify-center gap-4"
                                >
                                    {CATEGORIES.map((category, index) => (
                                        <motion.button
                                            key={index}
                                            variants={categoryVariants}
                                            className="group relative overflow-hidden rounded-lg border border-token-border-light dark:border-token-border-dark
                                                    hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 ease-in-out"
                                        >
                                            <div className="flex items-center p-2.5 space-x-1.5">
                                                <span className="text-2xl" style={{ color: category.color }}>
                                                    {category.icon}
                                                </span>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {category.title}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                    <motion.button
                                        variants={categoryVariants}
                                        className="rounded-lg border border-token-border-light dark:border-token-border-dark
                                                hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 ease-in-out p-2"
                                        aria-label="更多选项"
                                    >
                                        <MoreHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                    </motion.button>
                                </motion.nav>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}