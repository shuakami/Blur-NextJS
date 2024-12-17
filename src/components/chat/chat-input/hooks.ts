// src/components/chat/chat-input/hooks.ts
import { useCallback, useEffect, useRef, useReducer } from 'react';

// 常量
export const CONSTANTS = {
  INITIAL_HEIGHT: 40,
  MIN_HEIGHT: 40,
  MAX_HEIGHT: 200,
  DEFAULT_MAX_LENGTH: 10000,
  THRESHOLD_RATIO: 0.8
} as const;

// 类型定义
export interface ChatInputState {
  message: string;
  isSending: boolean;
  isDragging: boolean;
  files: File[];
}

export type ChatInputAction = 
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'ADD_FILES'; payload: File[] }
  | { type: 'REMOVE_FILE'; payload: number }
  | { type: 'CLEAR_FILES' };

// Reducer函数
export const chatInputReducer = (state: ChatInputState, action: ChatInputAction): ChatInputState => {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.payload] };
    case 'REMOVE_FILE':
      return { 
        ...state, 
        files: state.files.filter((_, index) => index !== action.payload) 
      };
    case 'CLEAR_FILES':
      return { ...state, files: [] };
    default:
      return state;
  }
};

// 处理输入框高度
export const useTextAreaResize = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
  const updateHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = `${CONSTANTS.INITIAL_HEIGHT}px`;
    const newHeight = Math.min(textarea.scrollHeight, CONSTANTS.MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight === CONSTANTS.MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(textarea);
    return () => resizeObserver.disconnect();
  }, [updateHeight]);

  return updateHeight;
};

// 文件上传
export const useFileUpload = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return { 
    fileInputRef,
    handleUploadClick
  };
};

// 模拟上传函数
export const simulateFileUpload = (file: File, onProgress: (progress: number) => void): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 150); // 每150ms增加5%,总共3秒
  });
};