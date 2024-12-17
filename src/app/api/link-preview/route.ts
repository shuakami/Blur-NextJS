import { unfurl } from 'unfurl.js'
import { LRUCache } from 'lru-cache'
import pTimeout from 'p-timeout'
import { rateLimit } from '@/lib/utils/rate-limit'

// 高级缓存配置
const cache = new LRUCache<string, CacheEntry>({
  max: 500, // 最大缓存条目
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天过期
  updateAgeOnGet: true, // 访问时更新年龄
  allowStale: true, // 允许返回过期数据
})

interface CacheEntry {
  data: any
  error?: string
  timestamp: number
  stale?: boolean
}

// 请求队列(用于合并重复请求)
const requestQueue = new Map<
  string, 
  Promise<{ data: any; error?: string }>
>()

// 获取预览(带重试)
async function fetchPreview(url: string) {
  const attempts = 2 // 重试次数
  let lastError: Error | null = null

  for (let i = 0; i < attempts; i++) {
    try {
      // 添加超时控制
      const result = await pTimeout(
        unfurl(url),
        {
          milliseconds: 5000,
          message: 'Preview fetch timeout'
        }
      )
      return { data: result }
    } catch (err) {
      lastError = err as Error
      // 最后一次尝试失败才记录错误
      if (i === attempts - 1) {
        console.error(`Preview fetch failed for ${url}:`, err)
        return { 
          data: null,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }
      // 重试前等待
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  return {
    data: null,
    error: lastError?.message || 'Max retries reached'
  }
}

// 限流器
const limiter = rateLimit({
  interval: 60 * 1000, // 1分钟
  uniqueTokenPerInterval: 500, // 最大令牌数
})

export async function GET(request: Request) {
  try {
    // 1. 提取URL参数
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')
    if (!targetUrl) {
      return new Response('Missing URL parameter', { status: 400 })
    }

    // 2. 应用限流
    try {
      await limiter.check(5, targetUrl) // 每个URL每分钟最多5次
    } catch {
      return new Response('Too Many Requests', { status: 429 })
    }

    // 3. 检查缓存
    const cached = cache.get(targetUrl)
    if (cached && !cached.stale) {
      return new Response(
        JSON.stringify(cached.data), 
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=3600'
          }
        }
      )
    }

    // 4. 检查请求队列(合并重复请求)
    let queuedRequest = requestQueue.get(targetUrl)
    if (!queuedRequest) {
      queuedRequest = fetchPreview(targetUrl)
      requestQueue.set(targetUrl, queuedRequest)
      
      // 请求完成后清理队列
      queuedRequest.finally(() => {
        requestQueue.delete(targetUrl)
      })
    }

    // 5. 等待结果
    const { data, error } = await queuedRequest

    // 6. 更新缓存
    const cacheEntry: CacheEntry = {
      data,
      error,
      timestamp: Date.now(),
      stale: false
    }
    cache.set(targetUrl, cacheEntry)

    // 7. 处理错误
    if (error) {
      // 如果有缓存的旧数据,降级使用
      if (cached?.data) {
        return new Response(
          JSON.stringify(cached.data),
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'STALE',
              'X-Error': error
            }
          }
        )
      }
      return new Response(error, { status: 500 })
    }

    // 8. 返回结果
    return new Response(
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': cached ? 'REVALIDATED' : 'MISS',
          'Cache-Control': 'public, max-age=3600'
        }
      }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}