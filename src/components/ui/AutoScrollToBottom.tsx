import React, {useEffect, useRef, useState} from "react";

interface AutoScrollToBottomProps {
    children: React.ReactNode;
    trigger?: any; // 用于检测新消息触发自动滚动
}

const AutoScrollToBottom: React.FC<AutoScrollToBottomProps> = ({children, trigger}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const scrollThreshold = 190; // 定义滚动阈值
    const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null); // 定时器

    // 自动缓动滚动到底部
    const scrollToBottom = () => {
        if (autoScrollEnabled && containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    };

    // 监听用户滚动，取消自动滚动
    const handleScroll = () => {
        if (containerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
            // 判断距离底部的距离，超过阈值时不再自动滚动
            if (scrollHeight - scrollTop > clientHeight + scrollThreshold) {
                setAutoScrollEnabled(false); // 用户手动滑动时禁用自动滚动
                if (scrollInterval) {
                    clearInterval(scrollInterval); // 停止缓动滚动
                }
            }
        }
    };

    useEffect(() => {
        // 每次 trigger 变化时，启动缓动自动滚动
        if (autoScrollEnabled) {
            // 设置每隔3秒滚动一次
            const interval = setInterval(scrollToBottom, 100);
            setScrollInterval(interval);
        }

        return () => {
            // 清除定时器，避免内存泄漏
            if (scrollInterval) {
                clearInterval(scrollInterval);
            }
        };
    }, [trigger, autoScrollEnabled]); // 当 trigger 或 autoScrollEnabled 变化时重新启动滚动

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll} // 监听用户的滚动
            style={{overflowY: "auto", height: "100%"}}
        >
            {children}
        </div>
    );
};

export default AutoScrollToBottom;
