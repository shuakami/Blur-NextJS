import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import useTranslation from '@/hooks/useTranslation';
import { useChatStateContext } from '@/app/[上下文]/ChatContext';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { debounce } from 'lodash';
import { useShortcutManager } from '@/providers/ShortcutProvider';
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts';

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
const DRAFT_KEY = 'chat_input_draft';

// 添加一个标记来追踪 toast 是否已显示
let toastShown = false;

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
        <button
            aria-label={isStreaming ? "停止生成" : "发送消息"}
            onClick={isStreaming ? onStop : onClick}
            className={buttonClassName}
            disabled={(!message && !isStreaming) || isSending}
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

SendButton.displayName = 'SendButton';

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    placeholder = '给 Blur 发送消息',
    maxLength = DEFAULT_MAX_LENGTH
}) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isStreaming, stopStreaming } = useChatStateContext();
    const shortcutManager = useShortcutManager();

    const maxHeight = useMemo(() => 
        Math.max(200, Math.min(window.innerHeight * 0.25, 400)),
    []);

    // 优化初始化检查和恢复逻辑
    useEffect(() => {
        if (toastShown) return; // 防止重复显示

        try {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft?.trim()) {
                toastShown = true;
                toast({
                    title: '发现未送的消息',
                    description: '是否要恢复上次未发送的内容？',
                    action: (
                        <ToastAction altText="恢复" onClick={() => {
                            setMessage(savedDraft);
                            localStorage.removeItem(DRAFT_KEY);
                            toastShown = false;
                        }}>
                            恢复
                        </ToastAction>
                    ),
                });
            }
        } catch (error) {
            console.error('读取草稿失败:', error);
        }

        // 组件卸载时重置标记
        return () => {
            toastShown = false;
        };
    }, []);

    // 优化自动保存草稿
    const debouncedSave = useMemo(
        () =>
            debounce((text: string) => {
                // 如果正在发送消息，不保存草稿
                if (isSending) return;
                
                if (!text.trim()) {
                    localStorage.removeItem(DRAFT_KEY);
                    return;
                }

                // 只有当内容变化时才存储
                const currentDraft = localStorage.getItem(DRAFT_KEY);
                if (currentDraft !== text) {
                    try {
                        localStorage.setItem(DRAFT_KEY, text);
                    } catch (error) {
                        console.error('保存草稿失败:', error);
                    }
                }
            }, 1000),
        [isSending]
    );

    // 在组件卸载时取消待处理的防抖操作
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    // 使用 ResizeObserver 替代手动计算高度
    useEffect(() => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        
        // 初始化样式
        textarea.style.height = `${INITIAL_HEIGHT}px`;
        textarea.style.overflowY = 'hidden';
        
        const resizeObserver = new ResizeObserver(() => {
            if (textarea.scrollHeight <= maxHeight) {
                textarea.style.overflowY = 'hidden';
            } else {
                textarea.style.overflowY = 'auto';
            }
        });
        
        resizeObserver.observe(textarea);
        
        return () => resizeObserver.disconnect();
    }, [maxHeight]);

    // 简化的消息处理函数
    const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        const newMessage = textarea.value;
        
        if (newMessage.length <= maxLength) {
            setMessage(newMessage);
            
            // 直接调整高度，不使用额外的 div
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
            
            // 使用 requestIdleCallback 处理草稿保存
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => debouncedSave(newMessage));
            } else {
                setTimeout(() => debouncedSave(newMessage), 1000);
            }
        }
    }, [maxLength, maxHeight, debouncedSave]);

    // 优化 handleSend
    const handleSend = useCallback(async () => {
        if (!message.trim() || isSending) return;
        
        setIsSending(true);
        try {
            await onSend(message);
            setMessage('');
            localStorage.removeItem(DRAFT_KEY);
            toastShown = false; // 重置 toast 标记
            if (textareaRef.current) {
                textareaRef.current.style.height = `${INITIAL_HEIGHT}px`;
            }
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

    const showCounter = message.length > maxLength * THRESHOLD_RATIO;

    // 聚焦输入框
    const focusInput = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // 如果当前输入框的值是 "/"，则清空它
            if (textareaRef.current.value === '/') {
                textareaRef.current.value = '';
            }
        }
    }, []);

    // 注册快捷键
    useEffect(() => {
        shortcutManager.register({
            command: 'FOCUS_CHAT',
            key: SHORTCUTS.FOCUS_CHAT,
            description: SHORTCUT_DESCRIPTIONS.FOCUS_CHAT,
            handler: focusInput,
            condition: () => {
                // 只在不是输入状态时触发
                return (
                    document.activeElement?.tagName !== 'INPUT' && 
                    document.activeElement?.tagName !== 'TEXTAREA'
                );
            }
        });

        // 额外添加键盘事件监听器来处理 "/" 键
        const handleKeyDown = (e: KeyboardEvent) => {
            const isSlashKey = e.key === '/' || e.key === 'Slash';
            if (isSlashKey && 
                document.activeElement?.tagName !== 'INPUT' && 
                document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                focusInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            shortcutManager.unregister('FOCUS_CHAT');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcutManager, focusInput]);

    return (
        <div className="max-w-3xl mx-auto px-4">
            <div className="relative flex w-full items-center">
                <div className="group relative flex w-full flex-col">
                    <div className="flex w-full items-end gap-1.5 rounded-[26px] p-2 
                                  bg-[#f4f4f4] dark:bg-[#2a2a2a] 
                                  transition-colors duration-200">
                        <div className="flex min-w-0 flex-1 flex-col pl-4">
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
                                         scrollbar-track-transparent
                                         transition-none" // 禁用所有过渡动画
                                style={{
                                    minHeight: `${MIN_HEIGHT}px`,
                                    maxHeight: `${maxHeight}px`
                                }}
                            />
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
                    </div>
                    
                    {showCounter && (
                        <div
                            className="absolute -bottom-6 right-2 text-xs text-gray-500"
                        >
                            {message.length}/{maxLength}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatInput);
