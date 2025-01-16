// src/components/chat/chat-input/ChatInput.tsx
import React, { useRef, useEffect, useCallback, useReducer, memo, useState } from 'react';
import useTranslation from '@/hooks/i18n/useTranslation';
import { useChatStateContext } from '@/app/[上下文]/ChatContext';
import { useShortcutManager } from '@/providers/ShortcutProvider';
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts';
import { cn } from '@/lib/utils/utils';
import { AnimatePresence, motion } from 'framer-motion';

import { 
  CONSTANTS,
  chatInputReducer,
  useTextAreaResize,
  useFileUpload,
  FileUploadInfo
} from './chat-input/hooks';
import {
  SendButton,
  UploadButton,
  RobotButton
} from './chat-input/components';
import {
  FilePreview,
  GlobalDropZone
} from './chat-input/file-upload';

interface ChatInputProps {
  onSend: (message: string, files?: FileUploadInfo[]) => void;
  placeholder?: string; 
  maxLength?: number;
  userId: string;
  jwtToken: string;
}

const ChatInput: React.FC<ChatInputProps> = memo(({
  onSend,
  placeholder = '给 Blur 发送消息',
  maxLength = CONSTANTS.DEFAULT_MAX_LENGTH,
  userId,
  jwtToken
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming, stopStreaming } = useChatStateContext();
  const shortcutManager = useShortcutManager();
  
  // 使用userId判断登录状态
  const isLoggedIn = Boolean(userId && jwtToken);

  const [state, dispatch] = useReducer(chatInputReducer, {
    message: '',
    isSending: false,
    isDragging: false,
    files: []
  });

  const updateHeight = useTextAreaResize(textareaRef);
  const { fileInputRef, handleUploadClick, handleFiles } = useFileUpload({
    userId,
    jwtToken,
    dispatch
  });

  // 使用独立的 state 来跟踪字数和是否超限
  const [charCount, setCharCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  // 检查是否可以发送消息
  const canSend = useCallback(() => {
    if (isStreaming || state.isSending) return false;
    if (!charCount && state.files.length === 0) return false;
    
    // 检查消息长度是否超过最大限制
    if (charCount > maxLength) return false;

    // 检查非图片文件上传状态
    const hasUnfinishedUploads = state.files.some(
      file => !file.file.type.startsWith('image/') && 
      (file.isUploading || file.error || !file.file_id)
    );
    
    return !hasUnfinishedUploads;
  }, [isStreaming, charCount, state.files, state.isSending, maxLength]);

  // 重置状态
  const resetState = useCallback(() => {
    dispatch({ type: 'SET_MESSAGE', payload: '' });
    dispatch({ type: 'CLEAR_FILES' });
    setCharCount(0);
    setIsOverLimit(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = `${CONSTANTS.INITIAL_HEIGHT}px`;
    }
  }, []);

  // 处理消息输入（非受控）
  const handleMessageChange = useCallback(() => {
    if (textareaRef.current) {
      const newMessage = textareaRef.current.value;
      // 使用 requestAnimationFrame 来优化性能
      requestAnimationFrame(() => {
        setCharCount(newMessage.length);
        setIsOverLimit(newMessage.length > maxLength);
        updateHeight();
      });
    }
  }, [maxLength, updateHeight]);

  // 处理文件删除
  const handleFileRemove = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FILE', payload: index });
  }, []);

  // 处理消息发送
  const handleSend = useCallback(async () => {
    if (!canSend()) return;
    if (!textareaRef.current) return;

    const message = textareaRef.current.value;

    dispatch({ type: 'SET_SENDING', payload: true });
    try {
      await onSend(message, state.files);
      resetState();
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
    }
  }, [canSend, onSend, resetState, state.files]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 处理粘贴事件
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedFiles = Array.from(e.clipboardData.files);
    if (pastedFiles.length > 0) {
      e.preventDefault();
      handleFiles(pastedFiles);
      return;
    }
  }, [handleFiles]);

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

  const showCounter = charCount > maxLength * CONSTANTS.THRESHOLD_RATIO;

  // 处理消息截断
  const handleTruncate = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = textareaRef.current.value.slice(0, maxLength);
      setCharCount(maxLength);
      setIsOverLimit(false);
      updateHeight();
    }
  }, [maxLength, updateHeight]);

  return (
    <>
      {isLoggedIn && <GlobalDropZone onDrop={handleFiles} />}
      <div className="relative">
        {isLoggedIn && (
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden"
            aria-label="文件上传"
            title="选择要上传的文件"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              handleFiles(files);
              e.target.value = ''; // 重置input
            }}
            multiple
          />
        )}
        <div className="max-w-3xl mx-auto">
          {isLoggedIn && (
            <AnimatePresence>
              {state.files.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <FilePreview 
                    files={state.files}
                    onRemove={handleFileRemove}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div className="px-4">
            <div className="relative flex w-full items-center">
              <div className="group relative flex w-full flex-col">
                <div className="flex w-full items-end rounded-[26px] p-2 
                              bg-[#f4f4f4] dark:bg-[#2a2a2a] 
                              transition-colors duration-200">
                  {isLoggedIn && (
                    <div className="flex items-center gap-1 mb-1 ms-0.5">
                      <UploadButton onClick={handleUploadClick} />
                      <RobotButton onClick={() => {}} />
                    </div>
                  )}
                  <div className={cn(
                    "flex min-w-0 flex-1 flex-col",
                    isLoggedIn ? "pl-2" : "pl-4"
                  )}>
                    <textarea
                      ref={textareaRef}
                      defaultValue=""
                      onInput={handleMessageChange}
                      onPaste={handlePaste}
                      onKeyDown={handleKeyDown}
                      placeholder={t(placeholder)}
                      rows={1}
                      className="block w-full resize-none bg-transparent py-2 
                               text-[15px] leading-6 
                               text-black dark:text-white
                               placeholder:text-gray-500 dark:placeholder:text-gray-400
                               focus:outline-none
                               min-h-[${CONSTANTS.MIN_HEIGHT}px] max-h-[${CONSTANTS.MAX_HEIGHT}px]"
                    />
                  </div>
                  <div className="mb-1 me-1">
                    <SendButton 
                      message={textareaRef.current?.value || ''}
                      isSending={state.isSending}
                      isStreaming={isStreaming ?? false}
                      onStop={stopStreaming ?? (() => {})}
                      onClick={handleSend}
                    />
                  </div>
                </div>
                
                {showCounter && (
                  <div className="absolute -bottom-6 right-2 flex items-center text-xs">
                    <span className={cn("mr-2", isOverLimit ? "text-red-500" : "text-gray-500")}>
                      {charCount}/{maxLength}
                    </span>
                    {isOverLimit && (
                      <button 
                        onClick={handleTruncate}
                        className="text-red-500 underline text-xs"
                        aria-label="截断消息"
                      >
                        截断
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
