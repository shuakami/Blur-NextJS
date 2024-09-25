import {StreamChunk, FinalInfo, SendMessageResponse} from '@/types/stream';

export const handleStream = async (
    stream: ReadableStream<Uint8Array>,
    onInitialResponse: (response: SendMessageResponse) => void,
    onChunkReceived: (chunk: StreamChunk) => void,
    onFinalInfo?: (finalInfo: FinalInfo) => void,
    onError?: (error: any) => void
) => {
    if (!window.ReadableStream) {
        console.error('您的浏览器不支持 ReadableStream。请升级浏览器以获得更好的体验。');
        if (onError) {
            onError(new Error('浏览器不支持 ReadableStream'));
        }
        return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});

            // 按行分割
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留未完成的行

            for (const line of lines) {
                if (line.trim() === '') continue;

                // 处理带有 "data: " 前缀的流式数据
                const cleanLine = line.trim().startsWith('data:') ? line.trim().substring(5).trim() : line.trim();

                try {
                    const parsed: SendMessageResponse = JSON.parse(cleanLine);

                    // 处理首次响应，可能包含 chat_title
                    if (parsed.chat_title) {
                        onInitialResponse(parsed);
                    }

                    // 处理 stream 中的每个 chunk
                    if (parsed.stream && parsed.stream.length > 0) {
                        parsed.stream.forEach((chunk: StreamChunk) => {
                            onChunkReceived(chunk);
                        });
                    }

                    // 处理 final_info
                    if (parsed.final_info) {
                        onFinalInfo && onFinalInfo(parsed.final_info);
                    }

                    // 处理错误
                    if (parsed.error) {
                        onError && onError(parsed.error);
                    }
                } catch (err) {
                    console.error('解析流式响应失败:', err);
                    onError && onError(err);
                }
            }
        }

        // 处理剩余的 buffer
        if (buffer.trim() !== '') {
            try {
                const cleanBuffer = buffer.trim().startsWith('data:') ? buffer.trim().substring(5).trim() : buffer.trim();
                const parsed: SendMessageResponse = JSON.parse(cleanBuffer);

                if (parsed.chat_title) {
                    onInitialResponse(parsed);
                }

                if (parsed.stream && parsed.stream.length > 0) {
                    parsed.stream.forEach((chunk: StreamChunk) => {
                        onChunkReceived(chunk);
                    });
                }

                if (parsed.final_info) {
                    onFinalInfo && onFinalInfo(parsed.final_info);
                }

                if (parsed.error) {
                    onError && onError(parsed.error);
                }
            } catch (err) {
                console.error('解析流式响应失败:', err);
                onError && onError(err);
            }
        }
    } catch (err) {
        console.error('读取流失败:', err);
        onError && onError(err);
    } finally {
        reader.releaseLock();
    }
};
