import React, { useMemo, useState, useEffect, useContext } from 'react';
import { Check, Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw, Pause } from 'lucide-react';
import { Spinner } from './spinner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/app/[上下文]/ChatContext';

interface MessageToolbarProps {
  content: string;
  messageId?: string;
  isLatestMessage: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
}

export function MessageToolbar({
  content,
  messageId,
  isLatestMessage,
  isStreaming,
  onRegenerate
}: MessageToolbarProps) {
  
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const { conversationId } = useChatContext();

  // 控制工具栏显示逻辑
  const visibility = useMemo(() => {
    if (isLatestMessage) {
      if (isStreaming) return 'hidden';
      return 'visible';
    }
    return 'hover';
  }, [isLatestMessage, isStreaming]);

  // 语音播放/暂停处理
  const handleVoicePlay = async () => {
    // 如果已经在播放，则暂停
    if (isPlaying && audioRef) {
      audioRef.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      
      // 如果已经有音频实例，直接播放
      if (audioRef) {
        await audioRef.play();
        return;
      }

      // 否则创建新的音频实例
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      
      if (!response.ok) {
        throw new Error('TTS failed');
      }

      // 如果400，则返回错误信息，打印error
      if (response.status === 400) {
        const errorMessage = await response.text();
        toast({
          title: "语音播放失败",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // 添加事件监听器
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioRef(null);
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', () => {
        setIsPlaying(false);
        setAudioRef(null);
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback failed');
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
      });

      setAudioRef(audio);
      await audio.play();

    } catch (error) {
      setIsPlaying(false);
      setAudioRef(null);
      toast({
        title: "语音播放失败",
        variant: "destructive"
      });
    }
  };

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        setAudioRef(null);
      }
    };
  }, []);

  // 复制内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({ title: "已复制到剪贴板" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "复制失败",
        variant: "destructive"
      });
    }
  };

  // 反馈处理
  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (!messageId || !conversationId || isLiked !== null) return;
    
    try {
      setIsLiked(type === 'like');
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          messageId,
          conversationId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Feedback failed');
      }

      toast({
        title: "感谢您的反馈",
        description: type === 'dislike' ? "我们会继续改进" : undefined
      });
    } catch (error) {
      setIsLiked(null);
      toast({
        title: "反馈提交失败",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive"
      });
    }
  };

  // 重新生成
  const handleRegenerate = async () => {
    if (!onRegenerate || isRegenerating) return;
    
    try {
      setIsRegenerating(true);
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const buttonClass = cn(
    "rounded-md p-1.5 transition-all duration-200",
    "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
    "dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  return (
    <div className={cn(
      "flex items-center space-x-1.5 transition-opacity duration-200 mt-1",
      visibility === 'hidden' && 'hidden',
      visibility === 'hover' && 'opacity-0 group-hover:opacity-100',
      visibility === 'visible' && 'opacity-100'
    )}>
      <div className="flex items-center gap-0.5">
        <button 
          onClick={handleVoicePlay}
          disabled={isPlaying && !audioRef}
          className={cn(buttonClass, isPlaying)}
          aria-label={isPlaying ? "暂停" : "朗读"}
        >
          {isPlaying ? (
            audioRef ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Spinner size={16} className="mt-1.5"/>
            )
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        <button 
          onClick={handleCopy}
          disabled={isCopied}
          className={buttonClass}
          aria-label={isCopied ? "已复制" : "复制"}
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        <div className="flex items-center gap-0.5">
          <button 
            onClick={() => handleFeedback('like')}
            disabled={isLiked !== null || !messageId || !conversationId}
            className={cn(
              buttonClass,
              isLiked === true && "text-neutral-900 dark:text-neutral-100",
              (!messageId || !conversationId) && "opacity-50 cursor-not-allowed"
            )}
            aria-label="不错"
          >
            <ThumbsUp 
              className="h-4 w-4" 
              fill={isLiked === true ? "currentColor" : "none"} 
            />
          </button>

          <button 
            onClick={() => handleFeedback('dislike')}
            disabled={isLiked !== null || !messageId || !conversationId}
            className={cn(
              buttonClass,
              isLiked === false && "text-neutral-900 dark:text-neutral-100",
              (!messageId || !conversationId) && "opacity-50 cursor-not-allowed"
            )}
            aria-label="差评"
          >
            <ThumbsDown 
              className="h-4 w-4" 
              fill={isLiked === false ? "currentColor" : "none"} 
            />
          </button>
        </div>

        <button 
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className={buttonClass}
          aria-label={isRegenerating ? "重新生成中" : "重新生成"}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}