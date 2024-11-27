import { unfurl } from 'unfurl.js'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// 内存缓存
const MEMORY_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天缓存
const MEMORY_CACHE_SIZE = 100; // 最多缓存100个链接

// 获取缓存目录
const getCachePath = (url: string) => {
  const hash = Buffer.from(url).toString('base64').replace(/[/+=]/g, '_');
  return join('/tmp', 'link-preview-cache', `${hash}.json`);
};

async function getFromCache(url: string) {
  // 1. 先检查内存缓存
  const memCache = MEMORY_CACHE.get(url);
  if (memCache && Date.now() - memCache.timestamp < CACHE_DURATION) {
    return memCache.data;
  }

  // 2. 检查文件缓存
  try {
    const cachePath = getCachePath(url);
    const content = await readFile(cachePath, 'utf-8');
    const { data, timestamp } = JSON.parse(content);
    
    if (Date.now() - timestamp < CACHE_DURATION) {
      // 更新内存缓存
      MEMORY_CACHE.set(url, { data, timestamp });
      return data;
    }
  } catch (e) {
    // 缓存不存在或已过期，忽略错误
  }
  
  return null;
}

async function setCache(url: string, data: any) {
  // 1. 更新内存缓存
  MEMORY_CACHE.set(url, { data, timestamp: Date.now() });
  
  // 2. 限制内存缓存大小
  if (MEMORY_CACHE.size > MEMORY_CACHE_SIZE) {
    const oldestKey = MEMORY_CACHE.keys().next().value;
    if (oldestKey) {
      MEMORY_CACHE.delete(oldestKey);
    }
  }

  // 3. 更新文件缓存
  try {
    const cachePath = getCachePath(url);
    const cacheDir = join('/tmp', 'link-preview-cache');
    
    if (!existsSync(cacheDir)) {
      await mkdir(cacheDir, { recursive: true });
    }
    
    await writeFile(
      cachePath,
      JSON.stringify({ data, timestamp: Date.now() }),
      'utf-8'
    );
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    // 尝试从缓存获取
    const cached = await getFromCache(targetUrl);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        },
      });
    }

    // 缓存未命中，获取新数据
    const metadata = await unfurl(targetUrl);
    
    // 存入缓存
    await setCache(targetUrl, metadata);

    return new Response(JSON.stringify(metadata), {
      headers: { 
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      },
    });
  } catch (error) {
    return new Response('Failed to fetch preview', { status: 500 });
  }
}