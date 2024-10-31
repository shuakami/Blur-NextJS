import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from '@/hooks/useTranslation';
import { useChatContext } from '@/app/[上下文]/ChatContext';

interface ChatInputProps {
    onSend: (message: string) => void;
    placeholder?: string;
    maxLength?: number;
}

// 预定义常量
const INITIAL_HEIGHT = 40;
const MIN_HEIGHT = 40;
const DEFAULT_MAX_LENGTH = 10000;
const THRESHOLD_RATIO = 0.8;

// 动画配置
const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 40,
    mass: 0.1,
} as const;

// 优化后的发送按钮组件
const SendButton = React.memo(({ 
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
    const buttonClassName = useMemo(() => `
        flex h-8 w-8 items-center justify-center 
        rounded-full transition-all duration-300 
        relative focus-visible:outline-none
        ${message || isStreaming ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}
        ${isSending ? 'scale-95' : 'scale-100'}
    `, [message, isStreaming, isSending]);

    return (
        <motion.button
            aria-label={isStreaming ? "停止生成" : "发送消息"}
            onClick={isStreaming ? onStop : onClick}
            className={buttonClassName}
            disabled={(!message && !isStreaming) || isSending}
            whileTap={{ scale: 0.95 }}
            whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
        >
            <AnimatePresence mode="wait">
                {isSending ? (
                    <motion.div
                        key="sending"
                        initial={{ opacity: 0, rotate: 0 }}
                        animate={{ opacity: 1, rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className={`w-4 h-4 border-2 rounded-full
                                  ${message ? 'border-white dark:border-gray-900 border-t-transparent' : 
                                            'border-gray-400 border-t-transparent'}`}
                    />
                ) : isStreaming ? (
                    <motion.div
                        key="stop"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-[10px] h-[10px] rounded-[1.5px] bg-white dark:bg-gray-900"
                    />
                ) : (
                    <motion.div
                        key="arrow"
                        initial={{ x: -5, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 5, opacity: 0 }}
                        className={message ? 'text-white dark:text-gray-900' : 'text-gray-400'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" 
                             fill="none" 
                             className="transition-transform group-hover:translate-x-[2px]">
                            <motion.path
                                d="M3 12h16.5m0 0l-6-6m6 6l-6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

SendButton.displayName = 'SendButton';

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    placeholder = '给 Blur 发送消息',
    maxLength = DEFAULT_MAX_LENGTH
}) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [height, setHeight] = useState(INITIAL_HEIGHT);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isStreaming, stopStreaming } = useChatContext();
    
    const maxHeight = useMemo(() => 
        Math.max(200, Math.min(window.innerHeight * 0.25, 400)),
    []);

    const updateHeight = useCallback(() => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const currentScrollTop = textarea.scrollTop;
        
        textarea.style.height = `${MIN_HEIGHT}px`;
        const scrollHeight = Math.max(MIN_HEIGHT, textarea.scrollHeight);
        const newHeight = Math.min(scrollHeight, maxHeight);
        
        if (newHeight !== height) {
            setHeight(newHeight);
            textarea.style.height = `${newHeight}px`;
            
            if (newHeight === maxHeight) {
                textarea.scrollTop = textarea.scrollHeight;
            } else {
                textarea.scrollTop = currentScrollTop;
            }
        }
    }, [height, maxHeight]);

    const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newMessage = e.target.value;
        if (newMessage.length <= maxLength) {
            setMessage(newMessage);
            // 使用 RAF 优化高度计算
            requestAnimationFrame(updateHeight);
        }
    }, [maxLength, updateHeight]);

    const handleSend = useCallback(async () => {
        if (!message.trim() || isSending) return;
        
        setIsSending(true);
        try {
            await onSend(message);
            setMessage('');
            setHeight(INITIAL_HEIGHT);
        } catch (error) {
            console.error('发送消息失败:', error);
        } finally {
            setIsSending(false);
        }
    }, [message, isSending, onSend]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // 使用 ResizeObserver 监听窗口变化
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateHeight);
        });
        
        if (textareaRef.current) {
            resizeObserver.observe(textareaRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [updateHeight]);

    const showCounter = message.length > maxLength * THRESHOLD_RATIO;

    return (
        <div className="max-w-3xl mx-auto px-4">
            <div className="relative flex w-full items-center">
                <div className="group relative flex w-full flex-col">
                    <motion.div 
                        className="flex w-full items-end gap-1.5 rounded-[26px] p-2 
                                  bg-[#f4f4f4] dark:bg-[#2a2a2a] 
                                  transition-colors duration-200"
                        layout
                    >
                        <div className="flex min-w-0 flex-1 flex-col pl-4">
                            <motion.div
                                initial={false}
                                animate={{ height }}
                                transition={springConfig}
                                className="relative"
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={handleMessageChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t(placeholder)}
                                    rows={1}
                                    className="block w-full resize-none bg-transparent py-2 
                                             text-[15px] leading-6
                                             text-gray-900 dark:text-gray-100
                                             placeholder:text-gray-500 dark:placeholder:text-gray-400
                                             focus:outline-none
                                             scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                                             scrollbar-track-transparent"
                                    style={{
                                        height: `${height}px`,
                                        overflowY: height >= maxHeight ? 'auto' : 'hidden'
                                    }}
                                />
                            </motion.div>
                        </div>

                        <div className="mb-1 me-1">
                            <SendButton 
                                message={message}
                                isSending={isSending}
                                isStreaming={isStreaming ?? false}
                                onStop={stopStreaming ?? (() => {})}
                                onClick={handleSend}
                            />
                        </div>
                    </motion.div>
                    
                    {showCounter && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -bottom-6 right-2 text-xs text-gray-500"
                        >
                            {message.length}/{maxLength}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatInput);