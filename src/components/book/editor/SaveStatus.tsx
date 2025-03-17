import React, { FC, useState, useEffect } from 'react';
import { TimeUtils } from '@/utils/timeUtils';
import { BOOK_CONSTANTS } from '@/constants/book';
import { AppError, ErrorHandler } from '@/services/error/errorHandler';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaveError?: AppError;
  onRetry?: () => void;
  timestamp?: number | string;
  /** 由外部传入的重试次数 */
  retryCount?: number;
  /** 由外部传入的下次重试时间戳 */
  nextRetryTime?: number;
}

export const SaveStatus: FC<SaveStatusProps> = ({
  isSaving,
  lastSaveError,
  onRetry,
  timestamp,
  retryCount = 0,
  nextRetryTime
}) => {

  // 用于展示"上次保存时间"的字符串
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const time = TimeUtils.getRelativeTime(timestamp);
    console.log('[SaveStatus] 初始化时间显示:', { timestamp, formattedTime: time });
    return time;
  });

  // 用于实时展示倒计时剩余秒数
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  /**
   * 根据 nextRetryTime 来更新倒计时。
   * 如果 nextRetryTime 不存在，说明当前没有排程中的重试，就不需要倒计时。
   */
  useEffect(() => {
    if (!nextRetryTime) {
      console.log('[SaveStatus] 没有下次重试时间，跳过倒计时');
      setRetryCountdown(0);
      return;
    }

    console.log('[SaveStatus] 设置重试倒计时，目标时间:', new Date(nextRetryTime).toISOString());

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((nextRetryTime - Date.now()) / 1000));
      setRetryCountdown(remaining);
    };

    // 先立即执行一次
    updateCountdown();
    // 每秒更新一次
    const timer = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [nextRetryTime]);

  /**
   * 每分钟更新一次时间显示
   */
  useEffect(() => {
    if (!timestamp) {
      console.log('[SaveStatus] 没有时间戳，跳过时间更新');
      return;
    }

    const timer = setInterval(() => {
      const newTime = TimeUtils.getRelativeTime(timestamp);
      setCurrentTime(newTime);
    }, BOOK_CONSTANTS.TIME.UPDATE_INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, [timestamp]);

  /**
   * 当外部传进来的 timestamp 更新后，立即更新显示
   */
  useEffect(() => {
    const newTime = TimeUtils.getRelativeTime(timestamp);
    setCurrentTime(newTime);
  }, [timestamp]);

  /**
   * 如果有错误，则渲染错误状态
   * 1. 如果还在自动重试 (retryCount < 3)，则显示倒计时 + "正在重试"
   * 2. 如果已经超过 3 次，则显示手动重试按钮
   */
  if (lastSaveError) {
    const shouldShowRetryButton = retryCount >= 3;

    return (
      <div className="flex items-center text-sm h-7 whitespace-nowrap mr-2 transition-all duration-300 ease-in-out">
        <span className="text-red-500 opacity-0 animate-fade-in">
          {ErrorHandler.getUserMessage(lastSaveError)}
          {retryCount > 0 && retryCount < 3 && nextRetryTime && (
            <span className="ml-1 text-gray-500">
              {retryCountdown > 0
                ? `(${retryCountdown}秒后重试 ${retryCount}/3)`
                : '正在重试...'}
            </span>
          )}
        </span>
        {shouldShowRetryButton && (
          <button
            onClick={() => {
              console.log('[SaveStatus] 点击重试按钮');
              onRetry?.();
            }}
            className="ml-2 px-2 py-0.5 text-xs text-red-500 hover:text-red-600 
                       bg-red-50 hover:bg-red-100 rounded transition-colors duration-200
                       opacity-0 animate-fade-in"
          >
            重试
          </button>
        )}
      </div>
    );
  }

  /**
   * 正常状态
   * 1. 如果 isSaving 为 true，则显示"保存中"或"重试中（倒计时）"文案
   * 2. 否则显示上次保存时间
   */
  return (
    <div className="flex items-center text-sm text-gray-700 h-7 whitespace-nowrap mr-2 transition-all duration-300 ease-in-out">
      <div className="relative flex items-center transition-all duration-300 ease-in-out">
        {isSaving ? (
          <span className="flex items-center opacity-0 animate-fade-in">
            <svg
              className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="opacity-0 animate-fade-in delay-100">
              {retryCount > 0 && retryCount < 3 && nextRetryTime ? (
                retryCountdown > 0
                  ? `重试中 (${retryCountdown}秒后第${retryCount + 1}次尝试)`
                  : `正在进行第${retryCount + 1}次尝试...`
              ) : (
                '保存中'
              )}
            </span>
          </span>
        ) : (
          <span className="opacity-0 animate-fade-in">上次编辑 {currentTime}</span>
        )}
      </div>
    </div>
  );
};
