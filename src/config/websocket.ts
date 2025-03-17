export const WS_CONFIG = {
    // 连接配置
    CONNECTION: {
        RECONNECT_DELAY: 3000,
        MAX_RECONNECT_ATTEMPTS: 5
    },
    
    // 消息配置
    MESSAGE: {
        ACK_TIMEOUT: 5000,
        CACHE_TIMEOUT: 5000
    },
    
    // 重试配置
    RETRY: {
        MAX_RETRIES: 3,
        INITIAL_DELAY: 1000,
        MAX_DELAY: 10000,
        BACKOFF_FACTOR: 2
    },
    
    // 防抖配置
    DEBOUNCE: {
        CONTENT_CHANGE: 1000,
        CURSOR_MOVE: 100
    },
    
    // 状态配置
    STATE: {
        SYNC_INTERVAL: 30000,
        SAVE_DELAY: 2000
    }
} as const;

// 环境配置
export const getWSEndpoint = () => {
    const API_URL = process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_LOCAL_WS_URL
        : process.env.NEXT_PUBLIC_PROD_WS_URL;
        
    if (!API_URL) {
        throw new Error('WebSocket URL not configured');
    }
    
    return API_URL;
};

// 重试延迟计算
export const calculateRetryDelay = (attempt: number): number => {
    const baseDelay = Math.min(
        WS_CONFIG.RETRY.INITIAL_DELAY * Math.pow(WS_CONFIG.RETRY.BACKOFF_FACTOR, attempt),
        WS_CONFIG.RETRY.MAX_DELAY
    );
    return baseDelay + Math.random() * 1000; // 添加随机抖动
}; 