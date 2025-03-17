import { useState, useEffect, useCallback, useRef } from 'react';

interface StreamConfig {
  charsPerFrame?: number;  // 每帧显示的字符数
  frameDelay?: number;     // 帧延迟(ms)
}

export const useStreamingCache = (
  content: string,
  isStreaming: boolean,
  config: StreamConfig = {}
) => {
  const { 
    charsPerFrame = 1,    // 默认每帧1个字符
    frameDelay = 16       // 默认16ms(约60fps)
  } = config;

  // 状态管理
  const [visibleContent, setVisibleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef(content);
  const positionRef = useRef(0);

  // 重置状态
  const reset = useCallback(() => {
    setVisibleContent("");
    positionRef.current = 0;
    setIsProcessing(false);
  }, []);

  // 处理流式内容
  useEffect(() => {
    if (!isStreaming || !content) {
      reset();
      return;
    }

    // 内容变化时重置
    if (content !== contentRef.current) {
      contentRef.current = content;
      reset();
      setIsProcessing(true);
    }
  }, [content, isStreaming, reset]);

  // 动画控制
  useEffect(() => {
    if (!isProcessing) return;

    let rafId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameDelay) {
        // 计算这一帧要显示的字符
        const start = positionRef.current;
        const end = Math.min(start + charsPerFrame, content.length);
        
        if (start < content.length) {
          // 智能分割,避免在单词中间断开
          let actualEnd = end;
          if (end < content.length && !/\s/.test(content[end])) {
            // 向后找到最近的空格或标点
            const nextSpace = content.slice(end).search(/[\s,.!?;:\n]/);
            if (nextSpace !== -1 && nextSpace < 5) { // 最多往后看5个字符
              actualEnd = end + nextSpace + 1;
            }
          }

          setVisibleContent(prev => prev + content.slice(start, actualEnd));
          positionRef.current = actualEnd;
          lastTime = currentTime;
        } else {
          setIsProcessing(false);
          return;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isProcessing, content, frameDelay, charsPerFrame]);

  return {
    visibleContent,
    isProcessing,
    progress: positionRef.current / (content.length || 1)
  };
}; 