// src/components/chat/chat-input/hooks.ts
import { useCallback, useEffect, useRef, useReducer } from 'react';
import { uploadFile } from '@/app/[消息发送]/upload_file';

// 防抖函数，支持清理
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  return debouncedFn;
};

// 节流函数
const throttle = <T extends (...args: any[]) => void>(fn: T, limit: number) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 常量
export const CONSTANTS = {
  INITIAL_HEIGHT: 40,
  MIN_HEIGHT: 40,
  MAX_HEIGHT: 200,
  DEFAULT_MAX_LENGTH: 10000,
  THRESHOLD_RATIO: 0.8
} as const;

// 添加文件信息类型
export interface FileInfo {
    name: string;
    type: string;
    size: number;
    url?: string;
}

// 更新文件上传信息类型
export interface FileUploadInfo {
    id: string;  // 添加唯一标识
    file: File;
    progress: number;
    isUploading: boolean;
    error?: string;
    file_id?: string;
    file_info?: FileInfo;
}

export interface ChatInputState {
  message: string;
  isSending: boolean;
  isDragging: boolean;
  files: FileUploadInfo[];
}

export type ChatInputAction = 
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'ADD_FILES'; payload: FileUploadInfo[] }
  | { type: 'REMOVE_FILE'; payload: number }
  | { type: 'CLEAR_FILES' }
  | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<FileUploadInfo> } };

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
      return { 
        ...state, 
        files: [...state.files, ...action.payload]
      };
    case 'REMOVE_FILE':
      return { 
        ...state, 
        files: state.files.filter((_, index) => index !== action.payload) 
      };
    case 'CLEAR_FILES':
      return { ...state, files: [] };
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file => 
          file.id === action.payload.id
            ? { ...file, ...action.payload.updates }
            : file
        )
      };
    default:
      return state;
  }
};

// 生成UUID函数
const generateUUID = (): string => {
  // 简单的UUID生成器，适用于大多数场景
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 处理入框高度
export const useTextAreaResize = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
  return useCallback(
    throttle(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = 'auto';
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, CONSTANTS.MIN_HEIGHT),
        CONSTANTS.MAX_HEIGHT
      );
      
      // 只在高度真正改变时更新
      if (textarea.style.height !== `${newHeight}px`) {
        textarea.style.height = `${newHeight}px`;
      }
    }, 16), // 约60fps的更新频率
    [textareaRef]
  );
};

// 文件上传
export interface UseFileUploadProps {
  userId: string;
  jwtToken: string;
  dispatch: React.Dispatch<ChatInputAction>;
}

export const useFileUpload = ({ userId, jwtToken, dispatch }: UseFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const concurrentUploads = useRef<number>(0);
  const maxConcurrentUploads = 3; // 设置最大并发上传数

  // 使用防抖来减少状态更新频率
  const debouncedDispatch = useRef(
    debounce((action: ChatInputAction) => {
      dispatch(action);
    }, 100)
  ).current;

  // 清理防抖
  useEffect(() => {
    return () => {
      debouncedDispatch.cancel();
    };
  }, [debouncedDispatch]);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      requestAnimationFrame(() => {
        fileInputRef.current?.click();
      });
    }
  }, []);

  const handleFileUpload = useCallback(async (fileInfo: FileUploadInfo) => {
    const controller = new AbortController();
    abortControllersRef.current.set(fileInfo.id, controller);
    concurrentUploads.current += 1;

    try {
      // 上传文件
      const result = await uploadFile({
        file: fileInfo.file,
        user_id: userId,
        jwtToken,
        onProgress: (progress) => {
          // 使用防抖的dispatch来更新进度
          debouncedDispatch({
            type: 'UPDATE_FILE',
            payload: {
              id: fileInfo.id,
              updates: { progress }
            }
          });
        },
        signal: controller.signal
      });

      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          id: fileInfo.id,
          updates: {
            file_id: result.file_id,
            progress: 100,
            isUploading: false,
            file_info: {
              name: result.filename,
              type: result.file_type,
              size: result.size || fileInfo.file.size,
              url: result.url
            }
          }
        }
      });

    } catch (error: any) {
      console.error('Error uploading file:', error);
      dispatch({
        type: 'UPDATE_FILE',
        payload: {
          id: fileInfo.id,
          updates: {
            error: error.message,
            isUploading: false
          }
        }
      });
    } finally {
      abortControllersRef.current.delete(fileInfo.id);
      concurrentUploads.current -= 1;
      processQueue();
    }
  }, [userId, jwtToken, dispatch, debouncedDispatch]);

  const uploadQueue = useRef<FileUploadInfo[]>([]);

  const processQueue = useCallback(() => {
    if (uploadQueue.current.length === 0 || concurrentUploads.current >= maxConcurrentUploads) {
      return;
    }
    const nextFile = uploadQueue.current.shift();
    if (nextFile) {
      handleFileUpload(nextFile);
    }
  }, [handleFileUpload]);

  const enqueueUpload = useCallback((fileInfo: FileUploadInfo) => {
    uploadQueue.current.push(fileInfo);
    processQueue();
  }, [processQueue]);

  const handleFiles = useCallback((selectedFiles: File[]) => {
    const fileInfos = selectedFiles.map(file => ({
      id: generateUUID(),
      file,
      progress: 0,
      isUploading: true
    }));
    
    // 添加文件到状态
    dispatch({ type: 'ADD_FILES', payload: fileInfos });
    
    // 将文件加入上传队列
    fileInfos.forEach(fileInfo => enqueueUpload(fileInfo));
  }, [enqueueUpload, dispatch]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 取消所有正在进行的上传
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
      // 清空上传队列
      uploadQueue.current = [];
    };
  }, []);

  return {
    fileInputRef,
    handleUploadClick,
    handleFiles
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
