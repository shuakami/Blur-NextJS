/**
 * useWebSocketSync - WebSocket 实时同步 Hook
 * 
 * @param bookId - 笔记 ID
 * @param setState - 编辑器状态更新函数
 */

import { useEffect } from 'react';
import { useWebSocket } from '@/app/[笔记管理]/WebSocketContext';
import { TimeUtils } from '@/utils/timeUtils';
import { EditorState } from '@/hooks/useBookEditor';
import { DocumentContent, ChangeSet } from '@/types/book';

interface UseWebSocketSyncProps {
    bookId: string;
    setState?: React.Dispatch<React.SetStateAction<EditorState>>;
}

// WebSocket 事件处理器类型
interface WebSocketHandlers {
    onContentChange: (content: DocumentContent, changes: ChangeSet) => void;
    onTitleChange: (title: string) => void;
    onVersionUpdate: (version: number) => void;
}

export const useWebSocketSync = ({
    bookId,
    setState
}: UseWebSocketSyncProps) => {
    const { joinRoom, leaveRoom } = useWebSocket();

    useEffect(() => {
        if (bookId) {
            const handlers: WebSocketHandlers = {
                onContentChange: (content: DocumentContent, changes: ChangeSet) => {
                    console.log('BookEditor: 收到WebSocket内容更新', {
                        content,
                        changes,
                        version: content.version
                    });
                    
                    if (setState) {
                        setState(prev => ({
                            ...prev,
                            content,
                            version: content.version,
                            lastSaveTime: content.meta?.last_modified || 
                                TimeUtils.toISOString(changes.timestamp) || 
                                new Date().toISOString()
                        }));
                    }
                },

                onTitleChange: (title: string) => {
                    console.log('BookEditor: 收到WebSocket标题更新', { title });
                    
                    if (setState) {
                        setState(prev => ({
                            ...prev,
                            title,
                            lastSaveTime: new Date().toISOString()
                        }));
                    }
                },

                onVersionUpdate: (version: number) => {
                    console.log('BookEditor: 收到WebSocket版本更新', { version });
                    
                    if (setState) {
                        setState(prev => ({
                            ...prev,
                            version
                        }));
                    }
                }
            };

            joinRoom(bookId, handlers);

            return () => {
                leaveRoom(bookId);
            };
        }
    }, [bookId, setState, joinRoom, leaveRoom]);
}; 