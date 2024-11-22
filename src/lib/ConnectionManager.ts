// ConnectionManager.ts

import { EventEmitter } from 'events';
import { apiAdapter } from './api/adapter';
import { 
    ConnectionState, 
    ConnectionStatus, 
    HeartbeatResponse, 
    SyncResponse,
    ConnectionError,
    ServerStatus 
} from '@/types/connection';

export class ConnectionManager extends EventEmitter {
    private static readonly API_PATHS = {
        HEARTBEAT: '/api/v1/connection/heartbeat',
        SYNC: '/api/v1/connection/sync'
    };

    private state: ConnectionState;
    private heartbeatTimer?: NodeJS.Timeout;
    private syncTimer?: NodeJS.Timeout;
    private reconnectTimer?: NodeJS.Timeout;
    private isDestroyed: boolean = false;
    
    // 配置参数
    private readonly config = {
        heartbeatInterval: 5000,    // 心跳间隔
        syncInterval: 10000,        // 同步间隔
        syncRetryDelay: 5000,       // 同步重试延迟
        maxReconnectDelay: 30000,   // 最大重连延迟
        minReconnectDelay: 1000,    // 最小重连延迟
        reconnectBackoff: 1.5,      // 重连退避系数
        healthyThreshold: 3         // 健康检查阈值
    };

    private reconnectAttempts: number = 0;
    private healthyHeartbeats: number = 0;
    private lastHeartbeatTime: number = 0;
    private lastSyncTime: number = 0;
    private consecutiveFailures: number = 0;
    private readonly MAX_FAILURES = 3;  // 连续失败3次后判定为断网

    constructor() {
        super();
        this.state = this.getInitialState();
    }

    private getInitialState(): ConnectionState {
        return {
            status: 'connecting',
            clientLatency: 0,
            serverLatency: 0,
            region: '',
            lastSyncId: null,
            lastUpdate: null,
            serverStatus: null,
            isHealthy: true
        };
    }

    public async start() {
        if (this.isDestroyed) {
            throw new Error('Cannot start a destroyed connection manager');
        }

        this.reconnectAttempts = 0;
        await this.connect();
    }

    private async connect() {
        try {
            await this.checkHeartbeat();
            this.scheduleNextHeartbeat();
            await this.startSync();
        } catch (error) {
            this.handleError(error as ConnectionError, 'heartbeat');
            this.scheduleReconnect();
        }
    }

    private scheduleNextHeartbeat() {
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        
        // 智能调整心跳间隔
        const interval = this.calculateHeartbeatInterval();
        this.heartbeatTimer = setTimeout(() => this.checkHeartbeat(), interval);
    }

    private calculateHeartbeatInterval(): number {
        // 根据网络状况动态调整心跳间隔
        const baseInterval = this.config.heartbeatInterval;
        return this.state.clientLatency > 3000 
            ? Math.min(baseInterval * 2, 15000)
            : baseInterval;
    }

    private async checkHeartbeat() {
        const now = Date.now();
        if (now - this.lastHeartbeatTime < 3000) return;
        this.lastHeartbeatTime = now;

        try {
            const startTime = now;
            const data = await apiAdapter.get<HeartbeatResponse>(
                ConnectionManager.API_PATHS.HEARTBEAT
            );
            const clientLatency = Date.now() - startTime;

            // 重置连续失败计数
            this.consecutiveFailures = 0;

            this.updateState({
                clientLatency,
                region: data.client_region,
                lastUpdate: data.timestamp,
                status: 'connected',
                isHealthy: true
            });

            if (!this.isDestroyed) {
                this.scheduleNextHeartbeat();
            }
        } catch (error) {
            this.handleError(error as ConnectionError, 'heartbeat');
            if (!this.isDestroyed) {
                this.scheduleNextHeartbeat();
            }
        }
    }

    private async startSync() {
        if (this.isDestroyed) return;

        const now = Date.now();
        if (now - this.lastSyncTime < this.config.syncInterval) return;
        this.lastSyncTime = now;

        try {
            const data = await apiAdapter.get<SyncResponse>(
                ConnectionManager.API_PATHS.SYNC,
                { params: { last_sync_id: this.state.lastSyncId } }
            );

            this.updateState({
                lastSyncId: data.sync_id,
                lastUpdate: data.timestamp,
                serverLatency: data.server_latency,
                serverStatus: data.server_status,
                isHealthy: true
            });

            if (data.has_updates) {
                this.emit('updates_available');
            }

            this.syncTimer = setTimeout(() => this.startSync(), this.config.syncInterval);
        } catch (error) {
            this.handleError(error as ConnectionError, 'sync');
            this.syncTimer = setTimeout(() => this.startSync(), this.config.syncInterval);
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;

        const isOffline = this.consecutiveFailures >= this.MAX_FAILURES;
        const baseDelay = isOffline 
            ? this.config.maxReconnectDelay / 2 
            : this.config.minReconnectDelay;

        const delay = Math.min(
            baseDelay * Math.pow(this.config.reconnectBackoff, this.reconnectAttempts),
            this.config.maxReconnectDelay
        );

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    /**
     * 处理错误，根据错误来源（heartbeat 或 sync）采取不同的策略
     * @param error 错误对象
     * @param source 错误来源，'heartbeat' 或 'sync'
     */
    private handleError(error: ConnectionError, source: 'heartbeat' | 'sync') {
        // 检查是否是明确的网络错误
        const isNetworkError = error.code === 'ERR_INTERNET_DISCONNECTED' || 
                              error.code === 'ERR_NETWORK' ||
                              error.code === 'NETWORK_ERROR';

        if (source === 'heartbeat') {
            this.consecutiveFailures++;
            
            // 如果是明确的网络错误，立即显示断网
            const isOffline = isNetworkError || this.consecutiveFailures >= this.MAX_FAILURES;
            
            this.updateState({
                status: isOffline ? 'disconnected' : this.state.status,
                error,
                isHealthy: false
            });
            
            if (isOffline) {
                this.reconnectAttempts = Math.max(this.reconnectAttempts, 3);
            }
            this.scheduleReconnect();
        } else if (source === 'sync') {
            // sync 错误只在明确是网络错误时才更新状态
            if (isNetworkError) {
                this.updateState({
                    status: 'disconnected',
                    error,
                    isHealthy: false
                });
            }
            console.error('Sync error:', error);
        }
    }

    public stop() {
        this.isDestroyed = true;
        if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
        if (this.syncTimer) clearTimeout(this.syncTimer);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.updateState(this.getInitialState());
    }

    private updateState(newState: Partial<ConnectionState>) {
        this.state = { ...this.state, ...newState };
        this.emit('stateChange', this.state);
    }

    public getState(): ConnectionState {
        return { ...this.state };
    }
}
