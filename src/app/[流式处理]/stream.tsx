// src/app/[流式处理]/stream.tsx
import {useState} from 'react';

// 定义流式响应的类型
interface StreamChunk {
    type: string;
    chunk_index: number;
    content: string;
    is_final_chunk: boolean;
    metadata: {
        timestamp: number;
    };
}

interface FinalInfo {
    total_tokens: number;
    generation_duration: number;
}

// 处理流式响应的函数
export const handleStream = async (stream: ReadableStream<Uint8Array>) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let receivedText = '';

    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        // 解码收到的字节
        const chunk = decoder.decode(value, {stream: true});
        // 处理接收到的文本（假设后端发送的是 JSON 行）
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            try {
                const parsed = JSON.parse(line);
                // 根据解析的内容进行处理
                if (parsed.stream) {
                    parsed.stream.forEach((chunk: StreamChunk) => {
                        // 例如，将内容追加到消息中
                        if (chunk.content) {
                            receivedText += chunk.content;
                            // 更新UI（需要通过状态管理来实现，这里仅作示例）
                            console.log('接收到的内容:', receivedText);
                        }
                        if (chunk.is_final_chunk) {
                            console.log('最终内容:', receivedText);
                            // 可以在此处触发完成状态或其他逻辑
                        }
                    });
                }
                if (parsed.final_info) {
                    console.log('最终信息:', parsed.final_info);
                }
                if (parsed.error) {
                    console.error('后端错误:', parsed.error);
                }
            } catch (err) {
                console.error('解析流式响应失败:', err);
            }
        }
    }

    reader.releaseLock();
};
