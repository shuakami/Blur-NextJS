// 基础状态类型
export type ConnectionStatus = 
    | 'connected'     // 连接正常
    | 'connecting'    // 正在连接
    | 'degraded'      // 服务降级
    | 'disconnected'  // 连接断开
    | 'server_down';  // 服务器无法访问

// 服务器状态
export interface ServerStatus {
    load: number;         // CPU负载 (0-1)
    memory: number;       // 内存使用率 (0-1)
    is_degraded: boolean; // 是否处于降级状态
}

// 心跳响应
export interface HeartbeatResponse {
    status: 'ok' | 'error';
    timestamp: string;        // ISO时间戳
    client_region: string;    // 客户端所在区域
    server_status: {
        is_degraded: boolean;
    };
}

// 同步响应
export interface SyncResponse {
    sync_id: string;
    timestamp: string;
    has_updates: boolean;
    server_latency: number;   // 服务器延迟
    server_status: ServerStatus;
}

// 连接状态
export interface ConnectionState {
    status: ConnectionStatus;
    clientLatency: number;    // 客户端测得的延迟
    serverLatency: number;    // 服务器测得的延迟
    region: string;           // 区域
    lastSyncId: string | null;
    lastUpdate: string | null;
    serverStatus: ServerStatus | null;
    isHealthy: boolean;
    error?: ConnectionError;
}

// 错误类型
export interface ConnectionError {
    code: string;
    status?: number;
    message: string;
    retryable: boolean;
}

// 适配器配置
export interface ApiAdapterConfig {
    baseURL: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}