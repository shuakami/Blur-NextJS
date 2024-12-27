/**
 * @fileoverview 聊天输入相关UI组件集合
 * @module components/chat/chat-input
 */

import React, { memo } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Upload, Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/utils';

// SendButton 组件
export const SendButton = React.memo(({ 
  message, 
  isSending,
  isStreaming,
  onStop, 
  onClick 
}: { 
  message: string; 
  isSending: boolean;
  isStreaming: boolean;
  onStop: () => void;
  onClick: () => void; 
}) => {
  const buttonClassName = `
    flex h-8 w-8 items-center justify-center 
    rounded-full transition-all duration-300 
    relative focus-visible:outline-none
    ${message || isStreaming ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}
    ${isSending ? 'scale-95' : 'scale-100'}
  `;

  return (
    <button
      aria-label={isStreaming ? "停止生成" : "发送消息"}
      onClick={isStreaming ? onStop : onClick}
      className={buttonClassName}
      disabled={isStreaming ? false : (!message || isSending)}
    >
      {isSending ? (
        <div className={`w-4 h-4 border-2 rounded-full 
                        ${message ? 'border-white dark:border-gray-900 border-t-transparent' : 
                                  'border-gray-400 border-t-transparent'}`} />
      ) : isStreaming ? (
        <div className="w-[10px] h-[10px] rounded-[1.5px] bg-white dark:bg-gray-900" />
      ) : (
        <div className={message ? 'text-white dark:text-gray-900' : 'text-gray-400'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-[2px]">
            <path
              d="M3 12h16.5m0 0l-6-6m6 6l-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
});

// UploadButton 组件
export const UploadButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center h-8 w-8
             transition-all duration-300
             focus-visible:outline-none"
    aria-label="上传文件"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z"
        fill="currentColor"
      />
    </svg>
  </button>
));

// ScrollArrowButton 组件
export const ScrollArrowButton = React.memo(({ 
  direction, 
  onClick 
}: { 
  direction: 'left' | 'right';
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      absolute ${direction === 'left' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 z-20
      w-8 h-8 flex items-center justify-center
      bg-white/90 dark:bg-gray-800/90 
      shadow-md rounded-full
      text-gray-600 dark:text-gray-300
      hover:bg-gray-50 dark:hover:bg-gray-700
      transition-all duration-200
    `}
  >
    {direction === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
  </button>
));

// RemoveButton 组件
export const RemoveButton = memo(({ 
  onClick, 
  disabled,
  className
}: { 
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(`
      absolute -right-0.5 -top-1 p-0.5 rounded-full
      bg-gray-900 dark:bg-gray-200
      text-gray-400 dark:text-gray-800
      transition-opacity duration-200
      ${disabled ? 'pointer-events-none' : ''}
    `, className)}
    type="button"
    disabled={disabled}
    aria-label="移除文件"
  >
    <X 
      size={12}
      className="will-change-transform"
      style={{ transform: 'translateZ(0)' }}
    />
  </button>
));

// FileProgressIndicator 组件
export const FileProgressIndicator = React.memo(({ 
  progress, 
  theme 
}: { 
  progress: number;
  theme: { color: string };
}) => (
  <>
    <span className="text-gray-300 dark:text-gray-600">•</span>
    <span
      className="transition-colors duration-300 theme-color"
      data-theme-color={theme.color}
    >
      {progress}%
    </span>
  </>
));

// RobotButton 组件
export const RobotButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled
            aria-label="AI助手（即将上线）"
            className="flex items-center justify-center h-8 w-8
                     transition-all duration-300
                     focus-visible:outline-none text-gray-450 dark:text-gray-800"
            onClick={onClick}
          >
            <Bot size={24} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>即将上线</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// 为所有组件添加displayName
SendButton.displayName = 'SendButton';
UploadButton.displayName = 'UploadButton';
ScrollArrowButton.displayName = 'ScrollArrowButton';
RemoveButton.displayName = 'RemoveButton';
FileProgressIndicator.displayName = 'FileProgressIndicator';
RobotButton.displayName = 'RobotButton';


