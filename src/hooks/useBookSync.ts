/**
 * useBookSync - 笔记数据同步 Hook
 * 
 * @param bookId - 笔记 ID
 * @param setState - 编辑器状态更新函数
 */

import { useEffect } from 'react';
import { useBook } from '@/app/[笔记管理]/BookContext';
import { TimeUtils } from '@/utils/timeUtils';
import { EditorState } from '@/hooks/useBookEditor';
import { DocumentContent } from '@/types/book';
import { ErrorHandler } from '@/services/error/errorHandler';

// 常量定义
const DEFAULT_VERSION = 1;
const DEFAULT_SCHEMA_VERSION = '1.0';

// 默认文档块
const DEFAULT_BLOCK = {
    type: 'paragraph' as const,
    content: null,
    id: '1'
};

// 创建默认文档内容
const createDefaultContent = (version: number, lastModified: string): DocumentContent => ({
    type: 'doc',
    version,
    blocks: [DEFAULT_BLOCK],
    meta: {
        last_modified: lastModified,
        modified_by: '',
        collaborators: [],
        schema_version: DEFAULT_SCHEMA_VERSION
    }
});

interface UseBookSyncProps {
    bookId: string;
    setState?: React.Dispatch<React.SetStateAction<EditorState>>;
}

export const useBookSync = ({
    bookId,
    setState
}: UseBookSyncProps) => {
    const { currentBook, loadBook } = useBook();

    // 加载笔记数据
    useEffect(() => {
        if (bookId) {
            loadBook(bookId).catch(err => {
                console.error('BookEditor: 加载笔记失败:', ErrorHandler.handle(err));
            });
        }
    }, [bookId, loadBook]);

    // 同步笔记数据 - 只处理初始加载和WebSocket断开重连的情况
    useEffect(() => {
        if (!currentBook || !setState) return;

        console.log('BookEditor: 收到服务器更新', {
            server_time: currentBook.updated_at,
            server_time_type: typeof currentBook.updated_at
        });

        // 使用 TimeUtils 安全地处理时间戳转换
        const serverTimeISO = TimeUtils.toISOString(currentBook.updated_at);
        const version = currentBook.version || DEFAULT_VERSION;

        try {
            // 解析content为DocumentContent
            let content: DocumentContent;
            
            if (typeof currentBook.content === 'string') {
                content = JSON.parse(currentBook.content);
            } else if (typeof currentBook.content === 'object' && currentBook.content !== null) {
                content = currentBook.content as DocumentContent;
            } else {
                content = createDefaultContent(version, serverTimeISO || new Date().toISOString());
            }

            // 确保content有正确的blocks结构
            if (!Array.isArray(content.blocks) || content.blocks.length === 0) {
                content.blocks = [DEFAULT_BLOCK];
            }

            // 更新内容和时间
            setState(prev => {
                // 如果本地时间比服务器时间新,保持本地状态
                if (prev.lastSaveTime && 
                    serverTimeISO && 
                    new Date(prev.lastSaveTime) > new Date(serverTimeISO)) {
                    return prev;
                }
                
                return {
                    ...prev,
                    content,
                    title: currentBook.title || '',
                    lastSaveTime: serverTimeISO,
                    version,
                    lastError: undefined // 清除之前的错误
                };
            });
        } catch (err) {
            const error = ErrorHandler.handle(err);
            console.error('BookEditor: 解析content失败:', error);
            
            // 发生错误时使用默认内容
            setState(prev => ({
                ...prev,
                content: createDefaultContent(version, serverTimeISO || new Date().toISOString()),
                title: currentBook.title || '',
                lastSaveTime: serverTimeISO,
                version,
                lastError: error
            }));
        }
    }, [currentBook, setState]);
}; 