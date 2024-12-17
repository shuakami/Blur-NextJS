// src/components/chat/chat-input/ChatInput.tsx
import React, { useRef, useEffect, useCallback, useReducer, useState, memo } from 'react';
import useTranslation from '@/hooks/i18n/useTranslation';
import { useChatStateContext } from '@/app/[上下文]/ChatContext';
import { useShortcutManager } from '@/providers/ShortcutProvider';
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from '@/constants/shortcuts';

import { 
  CONSTANTS,
  chatInputReducer,
  useTextAreaResize,
  useFileUpload,
  simulateFileUpload
} from './chat-input/hooks';
import {
  SendButton,
  UploadButton
} from './chat-input/components';
import {
    FilePreview,
    GlobalDropZone
} from './chat-input/file-upload';

// Types
interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  placeholder?: string; 
  maxLength?: number;
}

const ChatInput: React.FC<ChatInputProps> = memo(({
  onSend,
  placeholder = '给 Blur 发送消息',
  maxLength = CONSTANTS.DEFAULT_MAX_LENGTH
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming, stopStreaming } = useChatStateContext();
  const shortcutManager = useShortcutManager();
  const [uploadStatus, setUploadStatus] = useState<Record<string, { progress: number; error?: string }>>({});

  const [state, dispatch] = useReducer(chatInputReducer, {
    message: '',
    isSending: false,
    isDragging: false,
    files: []
  });

  const updateHeight = useTextAreaResize(textareaRef);
  const { fileInputRef, handleUploadClick } = useFileUpload();

  // 处理消息输入
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= maxLength) {
      dispatch({ type: 'SET_MESSAGE', payload: newMessage });
      queueMicrotask(updateHeight);
    }
  }, [maxLength, updateHeight]);

  // 处理文件上传
  const handleFileUpload = useCallback((uploadedFiles: File[]) => {
    console.log('文件上传:', uploadedFiles);
    dispatch({ type: 'ADD_FILES', payload: uploadedFiles });
  }, []);

  // 处理文件删除
  const handleFileRemove = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FILE', payload: index });
  }, []);

  // 处理消息发送
  const handleSend = useCallback(async () => {
    console.log('发送前的文件状态:', state.files);
    if (isStreaming || (!state.message.trim() && state.files.length === 0) || state.isSending) return;
    
    dispatch({ type: 'SET_SENDING', payload: true });
    try {
      await onSend(state.message, state.files.length > 0 ? state.files : undefined);
      dispatch({ type: 'SET_MESSAGE', payload: '' });
      dispatch({ type: 'CLEAR_FILES' });
      if (textareaRef.current) {
        textareaRef.current.style.height = `${CONSTANTS.INITIAL_HEIGHT}px`;
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
    }
  }, [state.message, state.files, state.isSending, isStreaming, onSend]);
  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 处理文件粘贴
    const pastedFiles = Array.from(e.clipboardData.files);
    if (pastedFiles.length > 0) {
      e.preventDefault();
      handleFileUpload(pastedFiles);
      return;
    }

    // 处理文本粘贴
    const pastedText = e.clipboardData.getData('text');
    const currentText = e.currentTarget.value;
    const selectionStart = e.currentTarget.selectionStart;
    const selectionEnd = e.currentTarget.selectionEnd;

    const newText = currentText.slice(0, selectionStart) + pastedText + currentText.slice(selectionEnd);

    if (newText.length > maxLength) {
      e.preventDefault();
      const truncatedText = newText.slice(0, maxLength);
      dispatch({ type: 'SET_MESSAGE', payload: truncatedText });
      queueMicrotask(updateHeight);
    }
  }, [maxLength, updateHeight, handleFileUpload]);

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

  const showCounter = state.message.length > maxLength * CONSTANTS.THRESHOLD_RATIO;

  return (
    <>
      <GlobalDropZone onDrop={handleFileUpload} />
      <div className="relative">
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden"
          aria-label="文件上传"
          title="选择要上传的文件"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFileUpload(files);
            e.target.value = ''; // 重置input
          }}
          multiple
        />
        <div className="max-w-3xl mx-auto">
          <FilePreview 
            files={state.files}
            uploadStatus={uploadStatus}
            onRemove={handleFileRemove}
          />
          <div className="px-4">
            <div className="relative flex w-full items-center">
              <div className="group relative flex w-full flex-col">
                <div className="flex w-full items-end rounded-[26px] p-2 
                              bg-[#f4f4f4] dark:bg-[#2a2a2a] 
                              transition-colors duration-200">
                  <div className="mb-1 ms-0.5">
                    <UploadButton onClick={handleUploadClick} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col pl-2">
                    <textarea
                      ref={textareaRef}
                      value={state.message}
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
                               transition-none
                               min-h-[${CONSTANTS.MIN_HEIGHT}px] max-h-[${CONSTANTS.MAX_HEIGHT}px]"
                    />
                  </div>
                  <div className="mb-1 me-1">
                    <SendButton 
                      message={state.message}
                      isSending={state.isSending}
                      isStreaming={isStreaming ?? false}
                      onStop={stopStreaming ?? (() => {})}
                      onClick={handleSend}
                    />
                  </div>
                </div>
                
                {showCounter && (
                  <div className="absolute -bottom-6 right-2 text-xs text-gray-500">
                    {state.message.length}/{maxLength}
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