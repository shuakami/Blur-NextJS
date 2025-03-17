// ConnectionManager.ts

import { EventEmitter } from 'events';
import { 
    ConnectionState, 
    ConnectionStatus, 
    HeartbeatResponse, 
    SyncResponse,
    ConnectionError,
    ServerStatus 
} from '@/types/connection';
import { apiAdapter } from './adapter';

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
    private readonly MAX_FAILURES = 2;  // 连续失败3次后判定为断网

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
            await this.startSync();
            this.scheduleNextHeartbeat();
        } catch (error) {
            this.handleError(error as ConnectionError, 'sync');
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

        try {
            const data = await apiAdapter.get<SyncResponse>(
                ConnectionManager.API_PATHS.SYNC,
                { params: { last_sync_id: this.state.lastSyncId } }
            );

            // sync 成功，重置失败计数
            this.consecutiveFailures = 0;
            this.reconnectAttempts = 0;

            this.updateState({
                status: 'connected',
                lastSyncId: data.sync_id,
                lastUpdate: data.timestamp,
                serverLatency: data.server_latency,
                serverStatus: data.server_status,
                isHealthy: true,
                error: undefined // 清除错误状态
            });

            if (data.has_updates) {
                this.emit('updates_available');
            }

            // 设置下一次 sync
            this.syncTimer = setTimeout(() => this.startSync(), this.config.syncInterval);
        } catch (error) {
            this.handleError(error as ConnectionError, 'sync');
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;

        const delay = Math.min(
            this.config.minReconnectDelay * Math.pow(this.config.reconnectBackoff, this.reconnectAttempts),
            this.config.maxReconnectDelay
        );

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            this.reconnectAttempts++;
            this.connect(); // 重连时也是从 sync 开始
        }, delay);
    }

    /**
     * 处理错误，根据错误来源（heartbeat 或 sync）采取不同的策略
     * @param error 错误对象
     * @param source 错误来源，'heartbeat' 或 'sync'
     */
    private handleError(error: ConnectionError, source: 'heartbeat' | 'sync') {
        // 更精确地区分错误类型
        const isNetworkError = error.code === 'ERR_INTERNET_DISCONNECTED' || 
                              error.code === 'ERR_NETWORK' ||
                              error.code === 'NETWORK_ERROR';
        
        const isServerError = error.code === 'ERR_CONNECTION_REFUSED' ||
                             error.status === 503 ||  // Service Unavailable
                             error.status === 502;    // Bad Gateway

        // 增加连接错误判断
        const isConnectionError = error.code === 'ERR_CONNECTION_REFUSED' ||
                                error.message?.includes('ECONNREFUSED') ||
                                error.message?.includes('connection refused');

        if (source === 'sync') {
            this.consecutiveFailures++;
            
            if (isNetworkError) {
                // 无网络
                this.updateState({
                    status: 'disconnected',
                    error: {
                        ...error,
                        message: '网络连接已断开，请检查网络后重试'
                    },
                    isHealthy: false
                });
            } else if (isConnectionError) {
                // 连接被拒绝
                this.updateState({
                    status: 'server_down',
                    error: {
                        ...error,
                        message: '无法连接到服务器'
                    },
                    isHealthy: false
                });
            } else if (isServerError) {
                // 服务器问题
                this.updateState({
                    status: 'server_down',
                    error: {
                        ...error,
                        message: '服务器暂时无法访问，请稍后重试'
                    },
                    isHealthy: false
                });
            } else {
                // 其他错误
                this.updateState({
                    status: this.consecutiveFailures >= this.MAX_FAILURES ? 'disconnected' : 'connecting',
                    error: {
                        ...error,
                        message: error.message || '连接出现问题，正在重试'
                    },
                    isHealthy: false
                });
            }

            // 清理现有定时器
            if (this.heartbeatTimer) {
                clearTimeout(this.heartbeatTimer);
                this.heartbeatTimer = undefined;
            }
            
            // 如果是连接错误，增加重连延迟
            if (isConnectionError) {
                const delay = Math.min(
                    this.config.minReconnectDelay * Math.pow(2, this.reconnectAttempts),
                    this.config.maxReconnectDelay
                );
                setTimeout(() => this.scheduleReconnect(), delay);
            } else {
                this.scheduleReconnect();
            }
        } else if (source === 'heartbeat') {
            this.consecutiveFailures++;
            
            if (this.consecutiveFailures >= this.MAX_FAILURES) {
                // 心跳连续失败，重新从 sync 开始
                if (this.heartbeatTimer) {
                    clearTimeout(this.heartbeatTimer);
                    this.heartbeatTimer = undefined;
                }
                
                // 如果是连接错误，显示友好提示
                if (isConnectionError) {
                    this.updateState({
                        status: 'server_down',
                        error: {
                            ...error,
                            message: '无法连接到服务器'
                        },
                        isHealthy: false
                    });
                }
                
                this.connect();
            } else {
                // 心跳偶尔失败，继续尝试
                this.scheduleNextHeartbeat();
            }
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
