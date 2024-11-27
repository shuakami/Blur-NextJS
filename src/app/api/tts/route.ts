import { NextResponse } from 'next/server';

const TTS_BASE_URL = 'https://fast-horse-44.deno.dev/v1/audio/speech';
const DEFAULT_MODEL = 'zh-CN-YunxiNeural';
const DEFAULT_VOICE = 'rate:0|pitch:0';
const MAX_TEXT_LENGTH = 10000; // 设最大文本长度
const CACHE_DURATION = 5 * 60; // 5分钟缓存

// 使用 Map 作为简单的内存缓存
const audioCache = new Map<string, {
  buffer: ArrayBuffer;
  timestamp: number;
}>();

// 清理过期缓存
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of audioCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 1000) {
      audioCache.delete(key);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: '缺少文本内容' },
        { status: 400 }
      );
    }

    // 检查文本长度
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `文本过长，最大支持 ${MAX_TEXT_LENGTH} 个字符` },
        { status: 400 }
      );
    }

    // 清理过期缓存
    cleanExpiredCache();

    // 检查缓存
    const cacheKey = `${text}_${DEFAULT_MODEL}_${DEFAULT_VOICE}`;
    const cachedAudio = audioCache.get(cacheKey);
    
    if (cachedAudio) {
      return new NextResponse(cachedAudio.buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cachedAudio.buffer.byteLength.toString(),
          'Cache-Control': `public, max-age=${CACHE_DURATION}`,
        }
      });
    }

    // 构建 TTS 请求 URL
    const url = new URL(TTS_BASE_URL);
    url.searchParams.append('model', DEFAULT_MODEL);
    url.searchParams.append('voice', DEFAULT_VOICE);
    url.searchParams.append('input', text);

    // 获取音频
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('TTS service failed');
    }

    // 获取音频数据
    const audioBuffer = await response.arrayBuffer();

    // 存入缓存
    audioCache.set(cacheKey, {
      buffer: audioBuffer,
      timestamp: Date.now()
    });

    // 返回音频文件
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': `public, max-age=${CACHE_DURATION}`,
      }
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: '语音合成失败' },
      { status: 500 }
    );
  }
}