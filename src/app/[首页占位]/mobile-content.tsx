"use client";

import React from 'react';
import { useUser } from "@clerk/nextjs";
import { motion } from 'framer-motion';
import { MessageSquare, Code, PenTool, Image } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import CText from '../copyright/ctext';

// 动态导入
const ChatInputWrapper = dynamic(() => import('@/components/ui/ChatInputWrapper'), {
  ssr: false,
  loading: () => <div className="h-[50px]" />
});

// 类型定义
interface MobileContentProps {
  onFirstMessage?: () => void;
  className?: string;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor?: string;
}

// 常量定义
const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: <Code className="h-6 w-6" />,
    title: '写代码',
    description: '智能编程助手',
    iconColor: 'text-blue-500 dark:text-blue-400'
  },
  {
    icon: <PenTool className="h-6 w-6" />,
    title: '写文章',
    description: '创作助手',
    iconColor: 'text-gray-600 dark:text-gray-300'
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'AI 对话',
    description: '自由交谈',
    iconColor: 'text-gray-600 dark:text-gray-300'
  },
  {
    icon: <Image className="h-6 w-6" />,
    title: '图片处理',
    description: '智能创作',
    iconColor: 'text-gray-600 dark:text-gray-300'
  }
];

const CARD_BASE_CLASSES = `
  bg-white dark:bg-gray-850 
  rounded-xl p-4  
  text-left 
  shadow-md
  dark:shadow-md 
  border border-gray-200  
  dark:border-gray-800
`;

// 问候语
const useGreeting = () => {
  const { user } = useUser();
  const userName = user?.firstName || user?.username || '';

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return '夜深了';
    if (hour < 12) return '早安';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  const timeGreeting = getTimeBasedGreeting();
  const greeting = userName ? `${timeGreeting}，${userName}` : timeGreeting;
  const subGreeting = userName ? '让我来帮你吧' : '需要我帮忙吗？';

  return { greeting, subGreeting };
};

// 功能卡片组件
const FeatureCard: React.FC<{ feature: FeatureCard }> = ({ feature }) => (
  <motion.button 
    className={CARD_BASE_CLASSES}
    whileHover={{ scale: 0.98 }}
  >
    <span className={`block mb-3 ${feature.iconColor}`}>
      {feature.icon}
    </span>
    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-0.5">
      {feature.title}
    </h3>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {feature.description}
    </p>
  </motion.button>
);

// 错误回退
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="text-center p-4">
    <p>出现错误: {error.message}</p>
    <button onClick={resetErrorBoundary} className="mt-2 text-blue-500">
      重试
    </button>
  </div>
);

// 主组件
export default function MobileContent({ onFirstMessage, className }: MobileContentProps) {
  const { greeting, subGreeting } = useGreeting();

  return (
    <div className={`flex flex-col py-4 px-4 ${className ?? ''}`}>
      <div className="px-4 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            {greeting}
          </h1>
          <p className="mt-2 text-xl font-medium text-gray-500 dark:text-gray-400">
            {subGreeting}
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            {FEATURE_CARDS.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pb-1">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ChatInputWrapper onFirstMessage={onFirstMessage} />
        </ErrorBoundary>
        <div className="mt-1"/>
        <div className="pb-2 pt-1">
          <CText />
        </div>
      </div>
    </div>
  );
}