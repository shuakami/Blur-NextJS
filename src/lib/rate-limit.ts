// 类型定义
interface RateLimitResult {
    success: boolean;
    current: number;
    limit: number;
    remaining: number;
}

// 内存存储
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// 主函数
export async function checkRateLimit(
    key: string,
    limit: number,
    window: string
): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = parseTimeWindow(window);
    const identifier = `${key}:${Math.floor(now / windowMs)}`;
    
    // 清理过期的记录
    for (const [k, v] of rateLimitStore.entries()) {
        if (now - v.timestamp > windowMs) {
            rateLimitStore.delete(k);
        }
    }
    
    const current = rateLimitStore.get(identifier);
    if (!current) {
        rateLimitStore.set(identifier, { count: 1, timestamp: now });
        return {
            success: true,
            current: 1,
            limit,
            remaining: limit - 1,
        };
    }
    
    current.count += 1;
    
    return {
        success: current.count <= limit,
        current: current.count,
        limit,
        remaining: Math.max(0, limit - current.count),
    };
}

function parseTimeWindow(window: string): number {
    const [, num, unit] = window.match(/(\d+)\s*([hmsd])/) || [];
    const ms = {
        h: 3600000,
        m: 60000,
        s: 1000,
        d: 86400000,
    }[unit] || 3600000;
    
    return Number(num) * ms;
}