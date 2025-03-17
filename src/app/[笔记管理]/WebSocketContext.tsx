import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useCallback,
    useState,
    useMemo,
} from 'react';
import { useUser } from '@clerk/nextjs';
import { ErrorHandler } from '@/services/error/errorHandler';
import { WS_CONFIG, getWSEndpoint } from '@/config/websocket';
import { DocumentContent, ChangeSet } from '@/types/book';
import { BaseMessage,MessageAck } from '@/services/websocket/IMessageManager';
import { MessageCenter } from '@/services/websocket/messageCenter';
import { VersionManager } from '@/services/version/versionManager';

// 常量定义
const WS_CONSTANTS = {
    NORMAL_CLOSE: 1000,
    VERSION_CONFLICT: 1401
} as const;

// 光标位置类型
interface CursorPosition {
    from: { pos: number; line: number; column: number };
    to: { pos: number; line: number; column: number };
}

// 用户元数据类型
interface UserMetadata {
    user_id: string;
    name: string;
    avatar_url?: string;
}

// WebSocket消息接口
interface WSMessage extends BaseMessage {
    user_id?: string;
    content?: DocumentContent;
    changes?: ChangeSet;
    title?: string;
    position?: CursorPosition;
    version?: number;
    users?: Record<string, UserMetadata>;
    metadata?: UserMetadata;
}

// 房间处理器类型
interface RoomHandlers {
    onContentChange?: (content: DocumentContent, changes: ChangeSet) => void;
    onCursorMove?: (userId: string, position: CursorPosition) => void;
    onUserConnected?: (userId: string) => void;
    onUserDisconnected?: (userId: string) => void;
    onOnlineUsers?: (users: Record<string, UserMetadata>) => void;
    onVersionUpdate?: (version: number) => void;
    onTitleChange?: (title: string) => void;
}

// WebSocket上下文类型
interface WebSocketContextType {
    joinRoom: (bookId: string, handlers: RoomHandlers) => void;
    leaveRoom: (bookId: string) => void;
    sendMessage: (bookId: string, message: Omit<WSMessage, 'book_id'>) => Promise<boolean>;
    isConnected: boolean;
}

// 房间订阅类型
interface RoomSubscription {
    handlers: RoomHandlers;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const [isConnected, setIsConnected] = useState(false);

    // 获取版本管理器和消息中心实例
    const versionManager = useMemo(() => VersionManager.getInstance(), []);
    const messageManager = useMemo(() => MessageCenter.getInstance(versionManager), [versionManager]);

    // 存储房间订阅信息
    const roomSubscriptions = useRef<Map<string, RoomSubscription>>(new Map());

    // 更新连接状态
    const updateConnectionStatus = useCallback((connected: boolean) => {
        console.log('[WebSocket] 更新连接状态:', connected);
        messageManager.updateConnectionStatus(connected);
        setIsConnected(connected);
    }, [messageManager]);

    // 创建用户元数据
    const createUserMetadata = useCallback((): UserMetadata => ({
        user_id: user?.id || '',
        name: user?.fullName || user?.username || '',
        avatar_url: user?.imageUrl
    }), [user]);

    // 计算重连延迟
    const calculateReconnectDelay = useCallback((attempt: number): number => {
        return Math.min(
            WS_CONFIG.CONNECTION.RECONNECT_DELAY * Math.pow(2, attempt),
            WS_CONFIG.RETRY.MAX_DELAY
        );
    }, []);

    // 处理重连
    const handleReconnect = useCallback(() => {
        if (reconnectAttemptsRef.current < WS_CONFIG.CONNECTION.MAX_RECONNECT_ATTEMPTS) {
            const delay = calculateReconnectDelay(reconnectAttemptsRef.current);
            reconnectAttemptsRef.current += 1;

            console.log(
                `[WebSocket] 将在 ${delay}ms 后尝试第 ${reconnectAttemptsRef.current} 次重连`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('[WebSocket] 尝试重新连接...');
                connect();
            }, delay);
        } else {
            console.error('[WebSocket] 达到最大重试次数，停止重连');
        }
    }, []);

    // 重新加入房间
    const rejoinRooms = useCallback((ws: WebSocket) => {
        roomSubscriptions.current.forEach((_, roomId) => {
            const message = {
                type: 'join_room' as const,
                book_id: roomId,
                metadata: createUserMetadata()
            };
            ws.send(JSON.stringify(message));
        });
    }, [createUserMetadata]);

    // 创建WebSocket连接
    const connect = useCallback(() => {
        if (!user?.id) return;

        try {
            const wsUrl = `${getWSEndpoint()}/api/v1/book/ws?user_id=${user.id}`;
            console.log('[WebSocket] 正在连接:', wsUrl);

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('[WebSocket] 连接成功');
                updateConnectionStatus(true);
                reconnectAttemptsRef.current = 0;

                // 重新加入所有房间
                rejoinRooms(ws);

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = undefined;
                }
            };

            ws.onclose = (event) => {
                console.log('[WebSocket] 连接断开:', event.code, event.reason);
                updateConnectionStatus(false);

                // 如果不是正常关闭，尝试重连
                if (event.code !== WS_CONSTANTS.NORMAL_CLOSE) {
                    handleReconnect();
                }
            };

            ws.onerror = (error) => {
                const appError = ErrorHandler.handle(error);
                console.error('[WebSocket] 错误:', appError);
                updateConnectionStatus(false);

                if (appError.type === 'CONNECTION_ERROR') {
                    console.error('[WebSocket] 连接错误:', ErrorHandler.getUserMessage(appError));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message: WSMessage = JSON.parse(event.data);

                    // 处理错误消息
                    if (message.type === 'error') {
                        if (message.message_id) {
                            const appError = message.code === WS_CONSTANTS.VERSION_CONFLICT
                                ? ErrorHandler.handle({
                                    message: message.message || '版本冲突',
                                    code: WS_CONSTANTS.VERSION_CONFLICT,
                                    details: message.details,
                                })
                                : ErrorHandler.handle(new Error(message.message || '服务器错误'));
                            messageManager.handleError(message.message_id, appError);
                        }
                        return;
                    }

                    // 处理版本更新
                    if (message.type === 'version_update') {
                        if (message.version !== undefined && message.book_id) {
                            console.log('[WebSocket] 收到版本更新:', {
                                version: message.version,
                                book_id: message.book_id
                            });

                            // 更新 versionManager
                            versionManager.updateVersion(message.version);

                            const subscription = roomSubscriptions.current.get(message.book_id);
                            if (subscription?.handlers.onVersionUpdate) {
                                subscription.handlers.onVersionUpdate(message.version);
                            }
                        }
                        return;
                    }

                    // 处理消息确认
                    if (message.type === 'message_ack') {
                        if (message.message_id) {
                            if (message.version !== undefined && message.book_id) {
                                // 更新 versionManager
                                versionManager.updateVersion(message.version);

                                const subscription = roomSubscriptions.current.get(message.book_id);
                                if (subscription?.handlers.onVersionUpdate) {
                                    subscription.handlers.onVersionUpdate(message.version);
                                }
                            }
                            messageManager.handleAck(message.message_id, message as MessageAck);
                        }
                        return;
                    }

                    // 处理房间消息
                    if (message.book_id) {
                        const subscription = roomSubscriptions.current.get(message.book_id);
                        if (!subscription) return;

                        switch (message.type) {
                            case 'content_change':
                                if (message.user_id !== user?.id && message.content && message.changes) {
                                    subscription.handlers.onContentChange?.(
                                        message.content,
                                        message.changes
                                    );
                                }
                                break;

                            case 'title_update':
                                if (message.user_id !== user?.id && message.title) {
                                    subscription.handlers.onTitleChange?.(message.title);
                                }
                                break;

                            case 'cursor_move':
                                if (message.user_id !== user?.id && message.position) {
                                    subscription.handlers.onCursorMove?.(
                                        message.user_id || '',
                                        message.position
                                    );
                                }
                                break;

                            case 'user_connected':
                                if (message.user_id) {
                                    subscription.handlers.onUserConnected?.(message.user_id);
                                }
                                break;

                            case 'user_disconnected':
                                if (message.user_id) {
                                    subscription.handlers.onUserDisconnected?.(message.user_id);
                                }
                                break;

                            case 'online_users':
                                if (message.users) {
                                    subscription.handlers.onOnlineUsers?.(message.users);
                                }
                                break;
                        }
                    }
                } catch (err) {
                    console.error('[WebSocket] 处理消息失败:', err);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            const error = ErrorHandler.handle(err);
            console.error('[WebSocket] 创建连接失败:', error);
            updateConnectionStatus(false);
        }
    }, [user, messageManager, updateConnectionStatus, rejoinRooms, handleReconnect]);

    // 初始化连接
    useEffect(() => {
        if (user?.id) {
            connect();
        }
        return () => {
            if (wsRef.current) {
                wsRef.current.close(WS_CONSTANTS.NORMAL_CLOSE);
                wsRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = undefined;
            }
        };
    }, [user, connect]);

    // 加入房间
    const joinRoom = useCallback((bookId: string, handlers: RoomHandlers) => {
        // 检查是否已经在房间中，如果是则只更新 handlers
        const existingSubscription = roomSubscriptions.current.get(bookId);
        if (existingSubscription) {
            console.log('[WebSocket] 更新房间订阅:', bookId);
            roomSubscriptions.current.set(bookId, { handlers });
            return;
        }

        console.log('[WebSocket] 加入房间:', bookId);
        roomSubscriptions.current.set(bookId, { handlers });

        if (wsRef.current?.readyState === WebSocket.OPEN && messageManager.isConnected()) {
            const message = {
                type: 'join_room' as const,
                book_id: bookId,
                metadata: createUserMetadata()
            };
            messageManager.sendMessage(wsRef.current, message);
        }
    }, [messageManager, createUserMetadata]);

    // 离开房间
    const leaveRoom = useCallback((bookId: string) => {
        console.log('[WebSocket] 离开房间:', bookId);
        roomSubscriptions.current.delete(bookId);

        if (wsRef.current?.readyState === WebSocket.OPEN && messageManager.isConnected()) {
            const message = {
                type: 'leave_room' as const,
                book_id: bookId
            };
            messageManager.sendMessage(wsRef.current, message);
        }
    }, [messageManager]);

    // 发送消息
    const sendMessage = useCallback(
        async (bookId: string, message: Omit<WSMessage, 'book_id'>): Promise<boolean> => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.error('[WebSocket] 连接未就绪，无法发送消息');
                return false;
            }

            try {
                return await messageManager.sendMessage(wsRef.current, {
                    ...message,
                    book_id: bookId
                });
            } catch (err) {
                const error = ErrorHandler.handle(err);
                console.error('[WebSocket] 发送消息失败:', error);
                return false;
            }
        },
        [messageManager]
    );

    const value = useMemo(
        () => ({
            joinRoom,
            leaveRoom,
            sendMessage,
            isConnected
        }),
        [joinRoom, leaveRoom, sendMessage, isConnected]
    );

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
