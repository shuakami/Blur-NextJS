"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Code, PenTool, FileText, Lightbulb, Briefcase, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';

// 动态导入聊天输入框组件
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), {
  ssr: false,
  loading: () => <div className="h-[50px]" />,
});

// 类型定义
interface HomepageContentProps {
  onFirstMessage?: () => void;
  className?: string;
}

interface Category {
  icon: React.ReactNode;
  title: string;
  color: string;
}

// 常量定义
const CATEGORIES: Category[] = [
  { icon: <Code size={16}/>, title: '代码', color: 'rgb(108, 113, 255)' },
  { icon: <PenTool size={16}/>, title: '写作', color: 'rgb(203, 139, 208)' },
  { icon: <FileText size={16}/>, title: '总结', color: 'rgb(234, 132, 68)' },
  { icon: <Lightbulb size={16}/>, title: '构思', color: 'rgb(226, 197, 65)' },
  { icon: <Briefcase size={16}/>, title: '建议', color: 'rgb(118, 208, 235)' },
];

const TARGET_TEXT = '今天想聊点什么？';
const RANDOM_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const BUTTON_BASE_CLASSES = "rounded-lg border border-token-border-light dark:border-token-border-dark hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 ease-in-out";

const ANIMATION = {
  DELAY_UNIT: 50,
  STABILITY_MAX: 3,
  TITLE_INTERVAL: 50,
  DONE_DELAY: 500,
} as const;

// 自定义 Hook: 标题动画
const useTitleAnimation = (targetText: string, randomChars: string) => {
  const [title, setTitle] = useState('');
  const [isDone, setIsDone] = useState(false);
  
  const randomChar = useCallback(() => 
    randomChars[Math.floor(Math.random() * randomChars.length)],
  [randomChars]);

  useEffect(() => {
    let index = 0;
    let stabilityCounter = 0;
    
    const interval = setInterval(() => {
      setTitle(prev => {
        if (prev === targetText) return prev;
        
        return Array.from({length: targetText.length}, (_, i) => {
          if (i < index) return targetText[i];
          if (i === index) return stabilityCounter < ANIMATION.STABILITY_MAX ? randomChar() : targetText[i];
          return ' ';
        }).join('');
      });

      stabilityCounter++;
      if (stabilityCounter > ANIMATION.STABILITY_MAX) {
        stabilityCounter = 0;
        index++;
      }

      if (index > targetText.length) {
        clearInterval(interval);
        setTimeout(() => setIsDone(true), ANIMATION.DONE_DELAY);
      }
    }, ANIMATION.TITLE_INTERVAL);

    return () => clearInterval(interval);
  }, [targetText, randomChar]);

  return { title, isDone };
};

// 错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="text-center p-4">
    <p>出现错误: {error.message}</p>
    <button onClick={resetErrorBoundary} className="mt-2 text-blue-500">
      重试
    </button>
  </div>
);

// 分类按钮组件
const CategoryButton = React.memo<{ category: Category; index: number }>(
  function CategoryButton({ category, index }) {
    return (
      <button
        className={`${BUTTON_BASE_CLASSES} group relative overflow-hidden opacity-0 scale-90 animate-category-appear`}
        style={{
          animationDelay: `${index * ANIMATION.DELAY_UNIT}ms`,
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
    );
  }
);

// 主组件
export default function HomepageContent({ onFirstMessage, className }: HomepageContentProps) {
  const { title, isDone } = useTitleAnimation(TARGET_TEXT, RANDOM_CHARS);

  return (
    <div className={`mx-auto flex h-full w-full flex-col text-base justify-center max-w-3xl ${className ?? ''}`}>
      {/* 标题区域 */}
      <div className="mb-8 text-center mt-0">
        <div className={`transition-opacity duration-300 ease-out ${title ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative inline-flex justify-center text-center">
            <h1 className="text-2xl font-semibold mb-4">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* 输入框和分类区域 */}
      <div className="relative w-full px-4">
        <div className="w-full">
          <div className="mx-auto max-w-3xl">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ChatInputWrapper onFirstMessage={onFirstMessage}/>
            </ErrorBoundary>
          </div>
        </div>
        
        {/* 分类按钮区域 */}
        {isDone && (
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
            className="overflow-hidden"
          >
            <div className="mt-6 max-w-3xl mx-auto">
              <nav className="flex flex-wrap justify-center gap-4">
                {CATEGORIES.map((category, index) => (
                  <CategoryButton 
                    key={category.title} 
                    category={category} 
                    index={index} 
                  />
                ))}
                <button
                  className={`${BUTTON_BASE_CLASSES} p-2 opacity-0 scale-90 animate-category-appear`}
                  style={{
                    animationDelay: `${CATEGORIES.length * ANIMATION.DELAY_UNIT}ms`,
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