import React, { useState, useRef, useEffect, useCallback } from 'react';
import useTranslation from '@/hooks/i18n/useTranslation';
import { useChatStateContext } from '@/app/[上下文]/ChatContext';
import { useShortcutManager } from '@/providers/ShortcutProvider';
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts';
import { toast } from '@/hooks/ui/use-toast';

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

// 发送按钮组件
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

    const maxHeight = 200;

    // 处理高度自适应
    const updateHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        textarea.style.height = `${INITIAL_HEIGHT}px`;
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY = newHeight === maxHeight ? 'auto' : 'hidden';
    }, [maxHeight]);

    // 监听内容变化
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(textarea);
        
        return () => resizeObserver.disconnect();
    }, [updateHeight]);

    // 处理消息输入
    const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newMessage = e.target.value;
        if (newMessage.length <= maxLength) {
            setMessage(newMessage);
            queueMicrotask(updateHeight);
        }
    }, [maxLength, updateHeight]);

    // 处理粘贴事件
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const currentText = e.currentTarget.value;
        const selectionStart = e.currentTarget.selectionStart;
        const selectionEnd = e.currentTarget.selectionEnd;
        
        const newText = currentText.slice(0, selectionStart) + pastedText + currentText.slice(selectionEnd);
        
        if (newText.length > maxLength) {
            e.preventDefault();
            const truncatedText = newText.slice(0, maxLength);
            setMessage(truncatedText);
            queueMicrotask(updateHeight);
        }
    }, [maxLength]);

    // 处理消息发送
    const handleSend = useCallback(async () => {
        if (!message.trim() || isSending) return;
        
        setIsSending(true);
        try {
            await onSend(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = `${INITIAL_HEIGHT}px`;
            }
        } catch (error) {
            console.error('发送消息失败:', error);
        } finally {
            setIsSending(false);
        }
    }, [message, isSending, onSend]);

    // 处理键盘事件
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // 聚焦输入框
    const focusInput = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.focus();
            if (textarea.value === '/') {
                textarea.value = '';
            }
        }
    }, []);

    // 注册快捷键
    useEffect(() => {
        const handleSlashKey = (e: KeyboardEvent) => {
            const isSlashKey = e.key === '/' || e.key === 'Slash';
            const isInputActive = document.activeElement?.tagName === 'INPUT' || 
                                document.activeElement?.tagName === 'TEXTAREA';
            
            if (isSlashKey && !isInputActive) {
                e.preventDefault();
                focusInput();
            }
        };

        shortcutManager.register({
            command: 'FOCUS_CHAT',
            key: SHORTCUTS.FOCUS_CHAT,
            description: SHORTCUT_DESCRIPTIONS.FOCUS_CHAT,
            handler: focusInput,
            condition: () => {
                return document.activeElement?.tagName !== 'INPUT' && 
                       document.activeElement?.tagName !== 'TEXTAREA';
            }
        });

        window.addEventListener('keydown', handleSlashKey);

        return () => {
            shortcutManager.unregister('FOCUS_CHAT');
            window.removeEventListener('keydown', handleSlashKey);
        };
    }, [shortcutManager, focusInput]);

    const showCounter = message.length > maxLength * THRESHOLD_RATIO;

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
                                onPaste={handlePaste}
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
                                         transition-none"
                                style={{
                                    minHeight: `${MIN_HEIGHT}px`,
                                    maxHeight: `${maxHeight}px`,
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
                        <div className="absolute -bottom-6 right-2 text-xs text-gray-500">
                            {message.length}/{maxLength}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatInput);
