import { DocumentContent } from '@/types/book';

// 版本事件类型与数据
export type VersionEventData = {
    version_updated: {
        oldVersion: number;
        newVersion: number;
        content: DocumentContent | null;
        isLocalUpdate: boolean;
    };
    version_conflict: {
        clientVersion: number;
        serverVersion: number;
    };
    content_updated: {
        version: number;
        content: DocumentContent;
    };
    error: {
        message: string;
        code: number;
        details?: Record<string, any>;
    };
};

export type VersionEvent = keyof VersionEventData;

// 事件处理器类型
export type EventHandler<T extends VersionEvent> = (data: VersionEventData[T]) => void;

// 版本更新结果类型
export interface VersionUpdateResult {
    content: DocumentContent;
    newVersion: number;
}

/**
 * 版本管理器接口
 */
export interface IVersionManager {
    // 事件处理
    on<T extends VersionEvent>(event: T, handler: EventHandler<T>): void;
    off<T extends VersionEvent>(event: T, handler: EventHandler<T>): void;

    // 状态查询
    getCurrentVersion(): number;
    getCurrentContent(): DocumentContent | null;
    getVersionHistory(version: number): DocumentContent | null;

    // 连接状态
    updateConnectionStatus(connected: boolean): void;

    // 版本管理
    prepareNewVersion(content: DocumentContent): VersionUpdateResult;
    confirmVersion(version: number, content: DocumentContent): void;
    updateVersion(version: number, content?: DocumentContent, isLocalUpdate?: boolean): void;
    reset(): void;
} 