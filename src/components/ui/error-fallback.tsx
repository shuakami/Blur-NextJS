"use client";

import React, { useState } from 'react';
import { AlertCircle, Check, Copy, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';

interface ErrorFallbackProps {
    error?: Error;
    resetErrorBoundary?: () => void;
    className?: string;
    title?: string;
    message?: string;
    showStack?: boolean;
    icon?: React.ReactNode;
    retryText?: string;
    retryButtonProps?: React.ComponentProps<typeof Button>;
}

const ErrorFallback = ({ 
    error, 
    resetErrorBoundary,
    className,
    title = '发生错误',
    message,
    showStack = process.env.NODE_ENV === 'development',
    icon = <AlertCircle className="w-4 h-4 text-red-500/70" />,
    retryText = '重试',
    retryButtonProps
}: ErrorFallbackProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (error?.stack) {
            navigator.clipboard.writeText(error.stack);
            setCopied(true);
        }
    };

    return (
        <div 
            role="alert"
            className={cn(
                "w-full rounded-xl overflow-hidden mt-2 mb-2",
                "bg-gradient-to-br from-white/90 to-white/50",
                "dark:from-gray-800/90 dark:to-gray-800/50",
                "backdrop-blur-xl shadow-sm",
                "border border-gray-100 dark:border-gray-500",
                className
            )}
        >
            <div className="px-4 py-3 flex items-center justify-between border-b border-red-100/10 dark:border-red-500/10">
                <div className="flex items-center space-x-2">
                    {icon}
                    <span className="text-sm font-medium text-red-500/90">
                        {title}
                    </span>
                </div>
                <div className="flex items-center">
                    {showStack && error?.stack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center space-x-2" 
                            title="复制错误信息"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? '已复制' : '复制错误信息'}</span>
                        </Button>
                    )}
                    {resetErrorBoundary && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center space-x-2"
                            onClick={resetErrorBoundary}
                            {...retryButtonProps}
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            <span>{retryText}</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-4 py-3 space-y-3">
                <p className="text-sm text-gray-600/90 dark:text-gray-300/90">
                    {message || error?.message || '发生了一些错误，请稍后重试'}
                </p>

                {showStack && error?.stack && (
                    <div className="relative">
                        <div className="max-h-[100px] overflow-y-auto 
                                      scrollbar-thin scrollbar-track-transparent
                                      scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                            <pre className="text-xs leading-4 font-mono 
                                          text-gray-500/70 dark:text-gray-400/70
                                          whitespace-pre-wrap break-all">
                                {error.stack}
                            </pre>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-6 
                                      bg-gradient-to-t from-white dark:from-gray-800 to-transparent 
                                      pointer-events-none" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorFallback; 