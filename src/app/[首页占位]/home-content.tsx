"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MessageCircle, Home, Gift, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ui/error-fallback';

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

// 常量定义
const CATEGORIES = [
  { icon: <MessageCircle size={20}/>, title: '祝福', color: '#FF4D4F' },
  { icon: <Home size={20}/>, title: '团圆', color: '#FF7A45' },
  { icon: <Gift size={20}/>, title: '福气', color: '#FAAD14' },
  { icon: <Sparkles size={20}/>, title: '愿望', color: '#FFC53D' },
  { icon: <Heart size={20}/>, title: '温暖', color: '#FF9C6B' },
] as const;

const MAIN_TEXT = '新年好';
const EMOJI_TEXT = '！٩( \'ᴗ\' )و';
const ANIMATION_DURATION = {
  TITLE_START: 0,
  TITLE_DURATION: 600,
  EMOJI_START: 200,
  EMOJI_DURATION: 600,
  CHAT_START: 100,
  CATEGORY_START: 400,
  CATEGORY_STAGGER: 40
} as const;

// 使用 CSS 动画代替 JS 动画
const KEYFRAMES = `
@keyframes mainTextReveal {
  0% { 
    transform: translateY(8px) scale(0.98);
    opacity: 0;
    filter: blur(4px);
  }
  50% {
    opacity: 0.8;
    filter: blur(0);
  }
  100% { 
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes emojiReveal {
  0% {
    transform: translateX(-4px) scale(0.96);
    opacity: 0;
    filter: blur(2px);
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes chatInputReveal {
  0% {
    transform: translateY(4px);
    opacity: 0;
    filter: blur(2px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes categoryAppear {
  0% {
    transform: translateY(6px) scale(0.98);
    opacity: 0;
    filter: blur(2px);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    filter: blur(1px);
  }
  to { 
    opacity: 1;
    filter: blur(0);
  }
}
`;

// 标题组件
const Title = React.memo(function Title() {
  return (
    <div className="mb-6 text-center mt-4">
      <style jsx global>{KEYFRAMES}</style>
      <div className="inline-flex items-center gap-0.5">
        <h1 
          className="text-2xl font-bold text-red-500/90 dark:text-red-400/90 inline-block"
          style={{
            animation: `mainTextReveal ${ANIMATION_DURATION.TITLE_DURATION}ms ease-out forwards`,
            animationDelay: `${ANIMATION_DURATION.TITLE_START}ms`,
            opacity: 0
          }}
        >
          {MAIN_TEXT}
        </h1>
        <span
          className="text-2xl font-bold text-red-500/90 dark:text-red-400/90 inline-block"
          style={{
            animation: `emojiReveal ${ANIMATION_DURATION.EMOJI_DURATION}ms ease-out forwards`,
            animationDelay: `${ANIMATION_DURATION.EMOJI_START}ms`,
            opacity: 0
          }}
        >
          {EMOJI_TEXT}
        </span>
      </div>
    </div>
  );
});

// 分类按钮组件
const CategoryButton = React.memo(function CategoryButton({ 
  category, 
  index 
}: { 
  category: typeof CATEGORIES[number];
  index: number;
}) {
  return (
    <motion.button
      className="relative px-8 py-3 transition-all duration-300 ease-out group"
      style={{
        animation: 'categoryAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        animationDelay: `${ANIMATION_DURATION.CATEGORY_START + index * ANIMATION_DURATION.CATEGORY_STAGGER}ms`,
        opacity: 0
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      <div className="flex flex-col items-center space-y-2">
        <span 
          className="text-xl transform transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" 
          style={{ color: category.color }}
        >
          {category.icon}
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">
          {category.title}
        </span>
      </div>
      
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                   pointer-events-none rounded-lg"
        style={{
          background: `radial-gradient(circle at center, ${category.color}15 0%, transparent 70%)`
        }}
      />
    </motion.button>
  );
});

// 分类按钮组
const Categories = React.memo(function Categories() {
  return (
    <div className="mt-6">
      <div className="max-w-2xl mx-auto">
        <nav className="flex justify-center items-center space-x-4">
          {CATEGORIES.map((category, index) => (
            <CategoryButton 
              key={category.title} 
              category={category} 
              index={index} 
            />
          ))}
        </nav>
      </div>
    </div>
  );
});

// 主组件
export default function HomepageContent({ onFirstMessage, className }: HomepageContentProps) {
  // 使用 useMemo 包装 ChatInputWrapper
  const chatInput = useMemo(() => (
    <div 
      className="w-full mb-6"
      style={{
        animation: 'chatInputReveal 0.6s ease-out forwards',
        animationDelay: `${ANIMATION_DURATION.CHAT_START}ms`,
        opacity: 0
      }}
    >
      <div className="mx-auto max-w-2xl">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ChatInputWrapper onFirstMessage={onFirstMessage}/>
        </ErrorBoundary>
      </div>
    </div>
  ), [onFirstMessage]);

  return (
    <div 
      className={`mx-auto flex h-full w-full flex-col text-base justify-center max-w-3xl ${className ?? ''}`}
      style={{
        animation: 'fadeIn 0.4s ease-out forwards'
      }}
    >
      <Title />
      <div className="relative w-full px-4">
        {chatInput}
        <Categories />
      </div>
    </div>
  );
}