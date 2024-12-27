// src/app/[上下文]/ChatInputWrapper.tsx

"use client";

import React, { useCallback, useState, useMemo } from 'react';
import ChatInput from '../chat/chat_input';
import { useMessageContext, useConversationContext } from '@/app/[上下文]/contexts';
import { useModel } from '@/components/ui/model_selector';
import useTranslation from '@/hooks/i18n/useTranslation';
import { useUser, useAuth } from '@clerk/nextjs';
import { FileUploadInfo } from '@/components/chat/chat-input/hooks';
import { SimpleUploadedFile } from '@/types/stream';

interface ChatInputWrapperProps {
    onFirstMessage?: () => void;
}

const ChatInputWrapper: React.FC<ChatInputWrapperProps> = ({ onFirstMessage }) => {
    const { t } = useTranslation();
    const { selectedModel } = useModel();
    const { messages, sendMessage, retryMessage } = useMessageContext();
    const { conversationId } = useConversationContext();
    const [isRetrying, setIsRetrying] = useState(false);
    const { user } = useUser();
    const { getToken } = useAuth();
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    // 获取 JWT token
    React.useEffect(() => {
        const fetchToken = async () => {
            const token = await getToken().catch(err => {
                console.error('获取 token 失败:', err);
                return null;
            });
            setJwtToken(token);
        };
        fetchToken();
    }, [getToken]);

    // 处理文件信息转换
    const processFiles = useCallback((files?: FileUploadInfo[]): SimpleUploadedFile[] | undefined => {
        if (!files?.length) return undefined;
        
        return files.filter(fileInfo => fileInfo.file_id).map(fileInfo => ({
            file_id: fileInfo.file_id!,
            name: fileInfo.file_info?.name || fileInfo.file.name,
            type: fileInfo.file_info?.type || fileInfo.file.type || 'application/octet-stream',
            file_type: fileInfo.file_info?.type || fileInfo.file.type || 'application/octet-stream',
            size: fileInfo.file_info?.size || fileInfo.file.size
        }));
    }, []);

    // 发送消息处理
    const handleSend = useCallback((message: string, files?: FileUploadInfo[]) => {
        if (!user?.id || !jwtToken) {
            console.error('用户未登录或 token 未获取');
            return;
        }

        const modelCode = selectedModel.code || 'claude';
        const processedFiles = processFiles(files);

        sendMessage({
            message,
            model: modelCode,
            conversationId: conversationId || undefined,
            files: processedFiles
        });

        if (onFirstMessage) {
            onFirstMessage();
        }
    }, [user?.id, jwtToken, selectedModel.code, conversationId, sendMessage, onFirstMessage, processFiles]);

    // 查找最后一条失败消息并重试
    const handleRetry = useCallback(async () => {
        if (isRetrying) return;
        
        setIsRetrying(true);
        try {
            const lastFailedMessage = messages.findLast(
                msg => msg.type === 'user' && msg.sendStatus === 'failed'
            );
            
            if (lastFailedMessage?.message_id) {
                await retryMessage(lastFailedMessage.message_id);
            }
        } catch (error) {
            console.error('重试失败:', error);
        } finally {
            setIsRetrying(false);
        }
    }, [messages, retryMessage, isRetrying]);

    // 检查最后一条消息是否失败
    const isLastMessageFailed = useMemo(() => {
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.sendStatus === 'failed' && !isRetrying;
    }, [messages, isRetrying]);

    if (isLastMessageFailed) {
        return (
            <div className="px-4 py-2">
                <div className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">
                    {t('生成回复时出错')}
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`
                            relative m-auto flex items-center justify-center gap-1.5 
                            px-4 py-2 rounded-full bg-black text-base
                            text-white dark:text-black dark:bg-white bg-opacity-90
                            ${isRetrying 
                                ? 'dark:bg-white hover:bg-gray-200 bg-black cursor-not-allowed' 
                                : 'dark:bg-white bg-black hover:bg-gray-900 dark:hover:bg-gray-200'
                            }
                            transition-colors duration-200
                        `}
                    >
                        <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`}
                        >
                            <path 
                                fillRule="evenodd" 
                                clipRule="evenodd" 
                                d="M4.47189 2.5C5.02418 2.5 5.47189 2.94772 5.47189 3.5V5.07196C7.17062 3.47759 9.45672 2.5 11.9719 2.5C17.2186 2.5 21.4719 6.75329 21.4719 12C21.4719 17.2467 17.2186 21.5 11.9719 21.5C7.10259 21.5 3.09017 17.8375 2.53689 13.1164C2.47261 12.5679 2.86517 12.0711 3.4137 12.0068C3.96223 11.9425 4.45901 12.3351 4.5233 12.8836C4.95988 16.6089 8.12898 19.5 11.9719 19.5C16.114 19.5 19.4719 16.1421 19.4719 12C19.4719 7.85786 16.114 4.5 11.9719 4.5C9.7515 4.5 7.75549 5.46469 6.38143 7H9C9.55228 7 10 7.44772 10 8C10 8.55228 9.55228 9 9 9H4.47189C3.93253 9 3.4929 8.57299 3.47262 8.03859C3.47172 8.01771 3.47147 7.99677 3.47189 7.9758V3.5C3.47189 2.94772 3.91961 2.5 4.47189 2.5Z" 
                                fill="currentColor"
                            />
                        </svg>
                        {isRetrying ? t('重试中...') : t('重新生成')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ChatInput 
            onSend={handleSend} 
            placeholder={t("给 Blur 发送消息")}
            userId={user?.id || ''}
            jwtToken={jwtToken || ''}
        />
    );
};

export default ChatInputWrapper;
