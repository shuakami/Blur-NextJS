import { useCallback, useRef, useEffect } from 'react';

interface SmartUpdateOptions {
    minInterval?: number;    // 最小更新间隔
    maxInterval?: number;    // 最大更新间隔
    batchSize?: number;      // 批量更新阈值
    contentThreshold?: number; // 内容变化阈值
    onUpdate: (content: any) => void;
}

export function useSmartUpdate({
    minInterval = 300,      // 降低最小间隔到300ms
    maxInterval = 1000,     // 缩短最大间隔到1000ms
    batchSize = 10,         // 保持批量大小为10
    contentThreshold = 100, // 保持内容阈值为100
    onUpdate
}: SmartUpdateOptions) {
    const lastContentRef = useRef<string>('');
    const lastUpdateTimeRef = useRef<number>(0);
    const updateQueueRef = useRef<Array<{content: any, timestamp: number}>>([]);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const isComposingRef = useRef(false);  // 添加输入法状态引用

    // 清理函数
    const cleanup = useCallback(() => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
    }, []);

    // 刷新更新队列
    const flushUpdates = useCallback(() => {
        if (updateQueueRef.current.length === 0) return;
        if (isComposingRef.current) return;  // 输入法组合时不更新

        const lastUpdate = updateQueueRef.current[updateQueueRef.current.length - 1];
        onUpdate(lastUpdate.content);
        
        updateQueueRef.current = [];
        cleanup();
    }, [onUpdate, cleanup]);

    // 确定更新类型
    const determineUpdateType = useCallback((contentString: string): 'immediate' | 'debounced' | 'throttled' => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        
        if (!lastContentRef.current) {
            return 'immediate';
        }

        // 输入法组合时使用debounce
        if (isComposingRef.current) {
            return 'debounced';
        }

        const contentDiff = Math.abs(contentString.length - lastContentRef.current.length);

        if (contentDiff > contentThreshold) {
            return 'immediate';
        }

        if (timeSinceLastUpdate < minInterval) {
            return 'debounced';
        }

        return 'throttled';
    }, [contentThreshold, minInterval]);

    // 处理更新
    const handleUpdate = useCallback((newContent: any, isComposing?: boolean) => {
        // 更新输入法状态
        isComposingRef.current = !!isComposing;

        const contentString = JSON.stringify(newContent);
        const updateType = determineUpdateType(contentString);
        const now = Date.now();

        switch (updateType) {
            case 'immediate':
                if (!isComposing) {  // 非输入法状态才立即更新
                    flushUpdates();
                    onUpdate(newContent);
                }
                break;

            case 'debounced':
                cleanup();
                updateQueueRef.current.push({ content: newContent, timestamp: now });
                timeoutIdRef.current = setTimeout(flushUpdates, minInterval);
                break;

            case 'throttled':
                updateQueueRef.current.push({ content: newContent, timestamp: now });
                if (updateQueueRef.current.length >= batchSize && !isComposing) {
                    flushUpdates();
                } else {
                    cleanup();
                    timeoutIdRef.current = setTimeout(flushUpdates, maxInterval);
                }
                break;
        }

        lastContentRef.current = contentString;
        lastUpdateTimeRef.current = now;
    }, [determineUpdateType, flushUpdates, cleanup, minInterval, maxInterval, batchSize, onUpdate]);

    // 组件卸载时清理
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return handleUpdate;
} 