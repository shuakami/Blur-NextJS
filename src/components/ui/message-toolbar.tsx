import React from 'react';
import { Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';

interface MessageToolbarProps {
  onVoicePlay?: () => void;
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onReset?: () => void;
}

export function MessageToolbar({
  onVoicePlay,
  onCopy,
  onLike,
  onDislike,
  onReset
}: MessageToolbarProps) {
  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center gap-0.5">
        {/* 语音播放按钮 */}
        <button 
          onClick={onVoicePlay}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          aria-label="朗读"
        >
          <Volume2 className="h-4 w-4" />
        </button>

        {/* 复制按钮 */}
        <button 
          onClick={onCopy}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          aria-label="复制"
        >
          <Copy className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-0.5">
          {/* 点赞按钮 */}
          <button 
            onClick={onLike}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label="不错"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>

          {/* 踩按钮 */}
          <button 
            onClick={onDislike}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label="差评"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>

        {/* 重置按钮 */}
        <button 
          onClick={onReset}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          aria-label="重置"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}