/**
 * useBookEditor - 笔记编辑器状态管理 Hook
 * 
 * @param bookId - 笔记 ID
 * @param messageManager - 消息管理器实例
 * @param versionManager - 版本管理器实例
 * 
 * @returns {
 *   content: 当前文档内容
 *   title: 当前标题
 *   isSaving: 是否正在保存
 *   lastSaveTime: 最后保存时间
 *   lastError: 最后的错误信息
 *   version: 当前版本号
 *   retryCount: 重试次数
 *   nextRetryTime: 下次重试时间
 *   updateContent: 更新内容的函数
 *   setState: 状态更新函数
 *   handleTitleChange: 标题变更处理
 *   handleContentChange: 内容变更处理
 * }
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useBook } from '@/app/[笔记管理]/BookContext';
import { useWebSocket } from '@/app/[笔记管理]/WebSocketContext';
import { useDebounce } from '@/hooks/useDebounce';
import { UpdateData, DocumentContent, ChangeSet } from '@/types/book';
import { WS_CONFIG } from '@/config/websocket';
import { ErrorHandler, AppError } from '@/services/error/errorHandler';
import { IMessageManager } from '@/services/websocket/IMessageManager';
import { calculateDocumentDiff } from '@/utils/documentDiff';
import { useUser } from '@clerk/nextjs';
import { IVersionManager } from '@/services/version/IVersionManager';

// 常量定义
const EDITOR_CONSTANTS = {
    MAX_RETRY_COUNT: 3,
    INITIAL_VERSION: 0,
    DEFAULT_SCHEMA_VERSION: '1.0',
    DEBOUNCE_TIME: WS_CONFIG.DEBOUNCE.CONTENT_CHANGE,
    RETRY_DELAY: WS_CONFIG.RETRY.INITIAL_DELAY,
    ERROR_CODES: {
        VERSION_CONFLICT: 1401
    }
} as const;

// 类型定义
interface PendingChange {
    content: DocumentContent;
    changes: ChangeSet;
    version: number;
}

interface RetryInfo {
    messageId: string;
    bookId?: string;
    type: string;
    retryCount: number;
    nextRetryTime: number;
}

// 编辑器状态类型
export interface EditorState {
    content: DocumentContent;
    title: string;
    isSaving: boolean;
    lastSaveTime: string | undefined;
    lastError: AppError | undefined;
    version: number;
    retryCount: number;
    nextRetryTime: number | undefined;
}

// 创建默认文档内容
const createDefaultContent = (version: number = EDITOR_CONSTANTS.INITIAL_VERSION): DocumentContent => ({
    type: 'doc',
    version,
    blocks: [],
    meta: {
        last_modified: new Date().toISOString(),
        modified_by: '',
        collaborators: [],
        schema_version: EDITOR_CONSTANTS.DEFAULT_SCHEMA_VERSION
    }
});

// 创建重试事件
const createRetryEvent = (bookId: string, retryCount: number): RetryInfo => ({
    messageId: crypto.randomUUID(),
    bookId,
    type: 'content_change',
    retryCount,
    nextRetryTime: Date.now() + EDITOR_CONSTANTS.RETRY_DELAY
});

// 创建重试定时器
const scheduleRetry = (
    bookId: string, 
    retryCount: number, 
    onRetry: (event: RetryInfo) => void
) => {
    const retryEvent = createRetryEvent(bookId, retryCount);
    const timer = setTimeout(() => {
        onRetry(retryEvent);
    }, EDITOR_CONSTANTS.RETRY_DELAY);
    return { timer, retryEvent };
};

export const useBookEditor = (
    bookId: string,
    messageManager: IMessageManager,
    versionManager: IVersionManager
) => {
    const { currentBook, updateBookContent } = useBook();
    const { isConnected, sendMessage, joinRoom } = useWebSocket();
    const { user } = useUser();

    // 初始化 state
    const [state, setState] = useState<EditorState>(() => {
        const initialVersion = versionManager.getCurrentVersion();
        console.log('[BookEditor] 初始化状态:', { version: initialVersion });

        let parsedContent = createDefaultContent(initialVersion);
        if (currentBook?.content) {
            try {
                parsedContent = typeof currentBook.content === 'string'
                    ? JSON.parse(currentBook.content)
                    : currentBook.content;
            } catch (err) {
                const error = ErrorHandler.handle(err);
                console.error('[BookEditor] 解析初始内容失败:', error);
            }
        }

        return {
            content: parsedContent,
            title: currentBook?.title || '',
            isSaving: false,
            lastSaveTime: undefined,
            lastError: undefined,
            version: initialVersion,
            retryCount: 0,
            nextRetryTime: undefined
        };
    });

    // 引用及定时器
    const retryTimeoutRef = useRef<NodeJS.Timeout>();
    const pendingChangesRef = useRef<PendingChange[]>([]);

    /**
     * 处理重试调度事件
     */
    const handleRetryScheduled = useCallback((info: RetryInfo) => {
        if (info.bookId === bookId && info.type === 'content_change') {
            console.log('[useBookEditor] 收到 retry_scheduled 事件:', info);
            setState(prev => ({
                ...prev,
                retryCount: info.retryCount,
                nextRetryTime: info.nextRetryTime,
                isSaving: true
            }));
        }
    }, [bookId]);

    /**
     * 监听 MessageCenter 的 "retry_scheduled" 事件
     */
    useEffect(() => {
        messageManager.on('retry_scheduled', handleRetryScheduled);
        return () => messageManager.off('retry_scheduled', handleRetryScheduled);
    }, [bookId, messageManager, handleRetryScheduled]);

    /**
     * 当 currentBook 发生变化时，更新本地编辑器状态
     */
    useEffect(() => {
        if (!currentBook) return;

        try {
            const content = typeof currentBook.content === 'string'
                ? JSON.parse(currentBook.content)
                : currentBook.content;

            const newContent: DocumentContent = {
                type: 'doc',
                version: currentBook.version || EDITOR_CONSTANTS.INITIAL_VERSION,
                blocks: content?.blocks || [],
                meta: content?.meta || {
                    last_modified: new Date().toISOString(),
                    modified_by: '',
                    collaborators: [],
                    schema_version: EDITOR_CONSTANTS.DEFAULT_SCHEMA_VERSION
                }
            };

            versionManager.updateVersion(newContent.version, newContent);

            setState(prev => ({
                ...prev,
                content: newContent,
                title: currentBook.title || prev.title,
                version: currentBook.version || prev.version,
                isSaving: false,
                lastError: undefined
            }));
        } catch (err) {
            const error = ErrorHandler.handle(err);
            console.error('[BookEditor] 解析Book内容失败:', error);
            setState(prev => ({
                ...prev,
                lastError: error
            }));
        }
    }, [currentBook, versionManager]);

    /**
     * 加入房间时添加回调
     */
    useEffect(() => {
        if (!bookId) return;

        joinRoom(bookId, {
            onContentChange: (content: DocumentContent, changes: ChangeSet) => {
                console.log('[BookEditor] 收到内容变更:', { version: content.version });
                versionManager.updateVersion(content.version, content);
                setState(prev => ({
                    ...prev,
                    content,
                    version: content.version,
                    lastError: undefined
                }));
            },
            onVersionUpdate: (version: number) => {
                console.log('[BookEditor] 收到版本更新:', { version });
                versionManager.updateVersion(version);
                setState(prev => ({
                    ...prev,
                    version,
                    lastError: undefined
                }));
            }
        });
    }, [bookId, joinRoom, versionManager]);

    /**
     * 获取缺失版本
     */
    const fetchMissingVersions = useCallback(async (missingVersions: number[]) => {
        console.log('[BookEditor] 获取缺失版本:', missingVersions);
        // TODO: 调用接口获取并在 versionManager 中补齐
    }, []);

    /**
     * 处理版本冲突
     */
    const handleVersionConflict = useCallback(async (error: AppError) => {
        if (!error.details?.missing_versions) return;

        try {
            await fetchMissingVersions(error.details.missing_versions);

            // 重试队列中的变更
            if (pendingChangesRef.current.length > 0) {
                const { content, changes } = pendingChangesRef.current[0];
                await debouncedUpdate({ content, changes });
            }
        } catch (err) {
            const handledError = ErrorHandler.handle(err);
            console.error('[BookEditor] 处理版本冲突失败:', handledError);
            setState(prev => ({
                ...prev,
                lastError: handledError,
                isSaving: false
            }));
        }
    }, [fetchMissingVersions]);

    /**
     * 清理重试状态
     */
    const clearRetryState = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = undefined;
        }
        setState(prev => ({
            ...prev,
            retryCount: 0,
            nextRetryTime: undefined,
            isSaving: false
        }));
    }, []);

    /**
     * 处理标题更新
     */
    const handleTitleUpdate = async (title: string, timestamp: string) => {
        if (isConnected) {
            try {
                const success = await sendMessage(bookId, {
                    type: 'title_update',
                    title
                });

                if (!success) throw new Error('WebSocket 标题更新失败');

                setState(prev => ({
                    ...prev,
                    title,
                    isSaving: false,
                    lastSaveTime: timestamp
                }));
                return;
            } catch (err) {
                console.error('[BookEditor] WebSocket 标题更新失败:', err);
            }
        }

        // WebSocket失败或不可用时，使用HTTP更新
        await updateBookContent(bookId, { title });
        setState(prev => ({
            ...prev,
            title,
            isSaving: false,
            lastSaveTime: timestamp
        }));
    };

    /**
     * 处理内容更新
     */
    const handleContentUpdate = async (data: UpdateData, timestamp: string) => {
        const { content: currentContent, newVersion } = versionManager.prepareNewVersion(state.content);

        const newContent: DocumentContent = data.content || {
            ...currentContent,
            meta: {
                ...currentContent.meta,
                last_modified: timestamp,
                modified_by: user?.id || ''
            }
        };

        // 计算文档差异
        const operations = calculateDocumentDiff(currentContent, newContent);
        const changes: ChangeSet = data.changes || {
            version: newVersion,
            timestamp,
            author: user?.id || '',
            operations
        };

        // 只有新增本地变更才入队列
        if (!data.content) {
            pendingChangesRef.current.push({
                content: newContent,
                changes,
                version: newVersion
            });
        }

        // 尝试 WebSocket 更新
        if (isConnected) {
            try {
                const success = await sendMessage(bookId, {
                    type: 'content_change',
                    content: newContent,
                    changes
                });

                if (!success) throw new Error('WebSocket 更新失败');

                setState(prev => ({
                    ...prev,
                    content: newContent,
                    version: newVersion,
                    isSaving: false,
                    lastSaveTime: timestamp
                }));

                if (!data.content) {
                    pendingChangesRef.current.shift();
                }

                clearRetryState();
                return;
            } catch (err) {
                const error = ErrorHandler.handle(err);
                console.error('[BookEditor] WebSocket 更新失败:', error);

                if (error.details?.code === EDITOR_CONSTANTS.ERROR_CODES.VERSION_CONFLICT) {
                    await handleVersionConflict(error);
                    return;
                }

                setState(prev => ({
                    ...prev,
                    lastError: error,
                    retryCount: EDITOR_CONSTANTS.MAX_RETRY_COUNT,
                    isSaving: false
                }));
            }
        }

        // WebSocket 不可用/失败时，使用 HTTP 更新
        try {
            await updateBookContent(bookId, {
                content: JSON.stringify(newContent)
            });

            setState(prev => ({
                ...prev,
                content: newContent,
                version: newVersion,
                isSaving: false,
                lastSaveTime: timestamp
            }));

            if (!data.content) {
                pendingChangesRef.current.shift();
            }

            clearRetryState();
        } catch (err) {
            const error = ErrorHandler.handle(err);
            console.error('[BookEditor] HTTP 更新失败:', error);
            
            setState(prev => ({
                ...prev,
                lastError: error,
                retryCount: state.retryCount + 1,
                isSaving: false
            }));

            // 如果还有重试机会，等待下次重试
            if (state.retryCount < EDITOR_CONSTANTS.MAX_RETRY_COUNT) {
                const { timer, retryEvent } = scheduleRetry(
                    bookId,
                    state.retryCount + 1,
                    (event) => {
                        handleRetryScheduled(event);
                    }
                );
                retryTimeoutRef.current = timer;
            }
        }
    };

    /**
     * 核心更新逻辑：WebSocket + HTTP 回退 + 自动重试 (防抖)
     */
    const debouncedUpdate = useDebounce(async (data: UpdateData) => {
        setState(prev => ({
            ...prev,
            isSaving: true,
            lastError: undefined
        }));

        const now = new Date().toISOString();

        try {
            // 标题更新
            if (data.title !== undefined) {
                await handleTitleUpdate(data.title, now);
                return;
            }

            // 内容更新
            await handleContentUpdate(data, now);
        } catch (err) {
            const error = ErrorHandler.handle(err);
            console.error('[BookEditor] 更新失败:', error);
            setState(prev => ({
                ...prev,
                lastError: error,
                isSaving: false
            }));
        }
    }, EDITOR_CONSTANTS.DEBOUNCE_TIME);

    /**
     * 处理编辑器内容变更
     */
    const handleContentChange = useCallback((newContent: DocumentContent) => {
        setState(prev => ({ ...prev, content: newContent }));
        debouncedUpdate({ content: newContent });
    }, [debouncedUpdate]);

    /**
     * 处理标题变更
     */
    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setState(prev => ({ ...prev, title: newTitle }));
        debouncedUpdate({ title: newTitle });
    }, [debouncedUpdate]);

    return {
        content: state.content,
        title: state.title,
        isSaving: state.isSaving,
        lastSaveTime: state.lastSaveTime,
        lastError: state.lastError,
        version: state.version,
        retryCount: state.retryCount,
        nextRetryTime: state.nextRetryTime,
        updateContent: debouncedUpdate,
        setState,
        handleTitleChange,
        handleContentChange
    };
};
