/**
 * VersionManager - 文档版本管理器
 * 
 * @class VersionManager
 * @implements IVersionManager
 * 
 * @property state - 版本状态
 *   - currentVersion: 当前版本号
 *   - lastSyncVersion: 最后同步的版本号
 *   - pendingVersions: 待确认的版本集合
 *   - content: 当前文档内容
 * 
 * @property versionHistory - 版本历史记录
 * @property isConnected - 连接状态
 * 
 * @method updateVersion - 更新版本
 * @method confirmVersion - 确认版本
 * @method prepareNewVersion - 准备新版本
 * @method handleVersionConflict - 处理版本冲突
 * @method reset - 重置版本状态
 */

import { AppError } from '@/services/error/errorHandler';
import { DocumentContent } from '@/types/book';
import { IVersionManager, VersionEvent, EventHandler, VersionEventData, VersionUpdateResult } from './IVersionManager';

// 常量定义
const VERSION_CONSTANTS = {
    ERROR_CODES: {
        VERSION_CONFLICT: 1401,
        CONNECTION_ERROR: 1402
    }
} as const;

// 版本状态类型
interface VersionState {
    currentVersion: number;
    lastSyncVersion: number;
    pendingVersions: Set<number>;
    content: DocumentContent | null;
}

/**
 * 版本管理器实现
 */
export class VersionManager implements IVersionManager {
    private static instance: VersionManager;
    private state: VersionState;
    private eventHandlers: Map<VersionEvent, Set<EventHandler<any>>>;
    private versionHistory: Map<number, DocumentContent>;
    private isConnected: boolean = false;

    private constructor() {
        this.state = {
            currentVersion: 0,
            lastSyncVersion: 0,
            pendingVersions: new Set(),
            content: null,
        };
        this.eventHandlers = new Map();
        this.versionHistory = new Map();
        console.log('[VersionManager] 初始化版本管理器');
    }

    static getInstance(): VersionManager {
        if (!this.instance) {
            this.instance = new VersionManager();
        }
        return this.instance;
    }

    // 实现 IVersionManager 接口

    on<T extends VersionEvent>(event: T, handler: EventHandler<T>): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)?.add(handler);
    }

    off<T extends VersionEvent>(event: T, handler: EventHandler<T>): void {
        this.eventHandlers.get(event)?.delete(handler);
    }

    private emit<T extends VersionEvent>(event: T, data: VersionEventData[T]): void {
        this.eventHandlers.get(event)?.forEach((handler) => handler(data));
    }

    getCurrentVersion(): number {
        return this.state.currentVersion;
    }

    getCurrentContent(): DocumentContent | null {
        return this.state.content;
    }

    getVersionHistory(version: number): DocumentContent | null {
        return this.versionHistory.get(version) || null;
    }

    updateConnectionStatus(connected: boolean): void {
        if (this.isConnected === connected) return;

        console.log('[VersionManager] 更新连接状态:', connected);
        this.isConnected = connected;

        if (!connected) {
            this.clearPendingVersions();
        } else {
            this.emitVersionUpdate(this.state.currentVersion, this.state.currentVersion, false);
        }
    }

    private clearPendingVersions(): void {
        if (this.state.pendingVersions.size === 0) return;

        console.log(
            '[VersionManager] 清理待处理版本:',
            Array.from(this.state.pendingVersions)
        );
        this.state.pendingVersions.clear();
        this.emitVersionUpdate(this.state.currentVersion, this.state.currentVersion, false);
    }

    prepareNewVersion(content: DocumentContent): VersionUpdateResult {
        if (!this.isConnected) {
            const error = new Error('WebSocket未连接，无法准备新版本');
            error.name = 'ConnectionError';
            throw error;
        }

        const currentVersion = this.state.currentVersion;
        const newVersion = currentVersion + 1;

        this.state.pendingVersions.add(newVersion);

        console.log('[VersionManager] 准备新版本:', {
            currentVersion,
            newVersion,
            pendingVersions: Array.from(this.state.pendingVersions)
        });

        return {
            content: {
                ...content,
                version: currentVersion
            },
            newVersion
        };
    }

    confirmVersion(version: number, content: DocumentContent): void {
        console.log('[VersionManager] 确认版本:', {
            version,
            isLocalUpdate: this.state.pendingVersions.has(version),
            pendingVersions: Array.from(this.state.pendingVersions),
            isConnected: this.isConnected
        });

        if (!this.validateVersionConfirmation(version)) return;

        const isLocalUpdate = this.state.pendingVersions.has(version);
        this.state.pendingVersions.delete(version);
        this.state.lastSyncVersion = version;

        this.updateVersion(version, content, isLocalUpdate);

        if (!isLocalUpdate) {
            this.emit('content_updated', { version, content });
        }
    }

    private validateVersionConfirmation(version: number): boolean {
        if (!this.isConnected) {
            console.error('[VersionManager] WebSocket未连接，忽略版本确认');
            return false;
        }

        if (version <= this.state.lastSyncVersion) {
            console.warn('[VersionManager] 收到过期的版本确认:', {
                version,
                lastSyncVersion: this.state.lastSyncVersion
            });
            return false;
        }

        return true;
    }

    updateVersion(version: number, content?: DocumentContent, isLocalUpdate: boolean = false): void {
        console.log('[VersionManager] 更新版本:', {
            oldVersion: this.state.currentVersion,
            newVersion: version,
            hasContent: !!content,
            isLocalUpdate,
            isConnected: this.isConnected
        });

        // 检查连接状态
        if (!this.isConnected && !isLocalUpdate) {
            console.error('[VersionManager] WebSocket未连接，忽略远程版本更新');
            return;
        }

        const oldVersion = this.state.currentVersion;
        
        // 更新当前版本
        this.state.currentVersion = version;
        this.state.lastSyncVersion = version;

        if (content) {
            this.updateContent(version, content);
        }

        // 清理小于当前版本的待处理版本
        Array.from(this.state.pendingVersions)
            .filter(v => v <= version)
            .forEach(v => this.state.pendingVersions.delete(v));

        this.emitVersionUpdate(oldVersion, version, isLocalUpdate);
    }

    private updateContent(version: number, content: DocumentContent): void {
        this.state.content = {
            ...content,
            version
        };
        this.versionHistory.set(version, this.state.content);
    }

    private emitVersionUpdate(oldVersion: number, newVersion: number, isLocalUpdate: boolean): void {
        this.emit('version_updated', {
            oldVersion,
            newVersion,
            content: this.state.content,
            isLocalUpdate
        });
    }

    handleVersionConflict(serverVersion: number): boolean {
        const hasConflict = serverVersion > this.state.currentVersion;
        if (hasConflict) {
            this.emit('version_conflict', {
                clientVersion: this.state.currentVersion,
                serverVersion
            });
        }
        return hasConflict;
    }

    reset(): void {
        this.state = {
            currentVersion: 0,
            lastSyncVersion: 0,
            pendingVersions: new Set(),
            content: null
        };
        this.versionHistory.clear();
        this.eventHandlers.clear();
        this.isConnected = false;
    }
}
