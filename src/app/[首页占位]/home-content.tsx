"use client";

import React, { useEffect, useState, useCallback } from 'react'
import { Monitor, Shirt, Mail, Code, PenTool, FileText, Lightbulb, Briefcase, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// 懒加载 ChatInputWrapper
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), {
  ssr: false,
  loading: () => <div className="h-[50px]" />
})

interface HomepageContentProps {
    onFirstMessage?: () => void;
}

// 添加接口定义
interface Suggestion {
    icon: React.ReactElement;
    title: string;
    subtitle: string;
}

interface Category {
    icon: React.ReactElement;
    title: string;
    color: string;
}

// 修改数组定义，移除 as const
const SUGGESTIONS: Suggestion[] = [
    { icon: <Monitor size={16}/>, title: '解释怀旧情怀', subtitle: '给一个幼儿园孩子听' },
    { icon: <Shirt size={16}/>, title: '帮我挑选', subtitle: '一套非常上镜的服装' },
    { icon: <Mail size={16}/>, title: '写一封电子邮件', subtitle: '向当地的水管工问询报价' },
    { icon: <Code size={16}/>, title: '编写一个 Python 脚本', subtitle: '用于自动发送每日电子邮件报告' },
];

const CATEGORIES: Category[] = [
    { icon: <Code size={16}/>, title: '代码', color: 'rgb(108, 113, 255)' },
    { icon: <PenTool size={16}/>, title: '写作', color: 'rgb(203, 139, 208)' },
    { icon: <FileText size={16}/>, title: '总结', color: 'rgb(234, 132, 68)' },
    { icon: <Lightbulb size={16}/>, title: '构思', color: 'rgb(226, 197, 65)' },
    { icon: <Briefcase size={16}/>, title: '建议', color: 'rgb(118, 208, 235)' },
];

const TARGET_TEXT = '今天想聊点什么？';
const RANDOM_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// 建议卡片组件
const SuggestionCard = React.memo(({ suggestion }: { suggestion: Suggestion }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-gray-800 
                    cursor-pointer border border-gray-100 dark:border-gray-700 transition-all duration-300">
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
));

// 分类按钮组件
const CategoryButton = React.memo(({ category, index }: { category: Category, index: number }) => (
    <button
        className="group relative overflow-hidden rounded-lg border 
                   border-token-border-light dark:border-token-border-dark
                   hover:bg-gray-50 dark:hover:bg-gray-750 
                   transition-all duration-200 ease-in-out
                   opacity-0 scale-90 animate-category-appear"
        style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'forwards'
        }}
    >
        <div className="flex items-center p-2.5 space-x-1.5">
            <span className="text-2xl" style={{ color: category.color }}>
                {category.icon}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {category.title}
            </span>
        </div>
    </button>
));

export default function HomepageContent({onFirstMessage}: HomepageContentProps) {
    const [title, setTitle] = useState('');
    const [animationDone, setAnimationDone] = useState(false);

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
                if (prev === TARGET_TEXT) return prev;
                
                return Array.from({length: TARGET_TEXT.length}, (_, i) => {
                    if (i < index) return TARGET_TEXT[i];
                    if (i === index) return stabilityCounter < maxStability ? randomChar() : TARGET_TEXT[i];
                    return ' ';
                }).join('');
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

    return (
        <div className="mx-auto flex h-full w-full flex-col text-base lg:justify-center md:max-w-3xl">
            {/* 标题*/}
            <div className="mb-12 hidden text-center lg:block">
                <div className={`transition-opacity duration-300 ease-out ${title ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="relative inline-flex justify-center text-center">
                        <h1 className="text-2xl font-semibold mb-5">
                            {title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* 移动端标题和建议列表 */}
            <div className="justify-end lg:justify-center flex h-full flex-shrink flex-col 
                          items-center overflow-y-hidden text-token-text-primary lg:hidden">
                <div className="flex sm:items-center md:flex-1 flex-shrink-0">
                    <h1 className={`text-2xl font-semibold mb-3 transition-opacity duration-300 
                                   ${title ? 'opacity-100' : 'opacity-0'}`}>
                        {title}
                    </h1>
                </div>
                
                <div className="mb-32 w-full flex-shrink overflow-y-hidden">
                    <div className="w-full px-4 sm:px-6">
                        <div className="grid grid-cols-1 gap-4 xs:mt-8 md:mt-0">
                            {SUGGESTIONS.map((suggestion, index) => (
                                <SuggestionCard key={index} suggestion={suggestion} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 输入框和分类 */}
            <div className="relative w-full">
                <div className="w-full max-md:fixed max-md:bottom-0 max-md:left-0 max-md:pb-6 max-md:pt-4 
                               max-md:bg-gradient-to-t max-md:from-white max-md:dark:from-gray-900 max-md:to-transparent
                               md:translate-y-0 lg:translate-y-[-16px]">
                    <div className="mx-auto max-w-3xl px-4">
                        <ChatInputWrapper onFirstMessage={onFirstMessage}/>
                    </div>
                </div>
                
                {animationDone && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ 
                            height: "auto",
                            transition: {
                                height: {
                                    duration: 0.4,
                                    ease: [0.25, 0.8, 0.25, 1]
                                }
                            }
                        }}
                        exit={{ height: 0 }}
                        className="hidden lg:block overflow-hidden"
                    >
                        <div className="mt-6 max-w-3xl mx-auto">
                            <nav className="flex flex-wrap justify-center gap-4">
                                {CATEGORIES.map((category, index) => (
                                    <CategoryButton key={index} category={category} index={index} />
                                ))}
                                <button
                                    className="rounded-lg border border-token-border-light dark:border-token-border-dark
                                             hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 
                                             ease-in-out p-2 opacity-0 scale-90 animate-category-appear"
                                    style={{
                                        animationDelay: `${CATEGORIES.length * 50}ms`,
                                        animationFillMode: 'forwards'
                                    }}
                                    aria-label="更多选项"
                                >
                                    <MoreHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </button>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}