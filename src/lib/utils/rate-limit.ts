/**
 * @fileoverview 简单的内存限流器实现
 */

interface RateLimiterOptions {
  interval: number // 时间窗口(ms)
  uniqueTokenPerInterval: number // 最大令牌数
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

export function rateLimit(options: RateLimiterOptions) {
  const tokenBuckets = new Map<string, TokenBucket>()
  
  // 清理过期的令牌桶
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of tokenBuckets.entries()) {
      if (now - bucket.lastRefill > options.interval) {
        tokenBuckets.delete(key)
      }
    }
  }, options.interval)

  return {
    async check(limit: number, key: string = 'global') {
      const now = Date.now()
      let bucket = tokenBuckets.get(key)

      // 创建新的令牌桶或重置过期的
      if (!bucket || now - bucket.lastRefill > options.interval) {
        bucket = {
          tokens: options.uniqueTokenPerInterval,
          lastRefill: now
        }
        tokenBuckets.set(key, bucket)
      }

      // 检查令牌是否足够
      if (bucket.tokens < limit) {
        throw new Error('Rate limit exceeded')
      }

      // 消耗令牌
      bucket.tokens -= limit
      return true
    },

    // 重置指定key的限流
    reset(key: string = 'global') {
      tokenBuckets.delete(key)
    }
  }
} 