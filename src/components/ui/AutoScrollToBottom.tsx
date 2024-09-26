import React, {useEffect, useRef, useState} from "react";

interface AutoScrollToBottomProps {
    children: React.ReactNode;
    trigger?: any; // 用于检测新消息触发自动滚动
}

const AutoScrollToBottom: React.FC<AutoScrollToBottomProps> = ({children, trigger}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

    // 自动滚动到底部
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
            // 如果滚动条没有接近底部，禁用自动滚动
            if (scrollHeight - scrollTop > clientHeight + 50) {
                setAutoScrollEnabled(false);
            } else {
                setAutoScrollEnabled(true);
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [trigger]); // 当 trigger 变化时自动滚动

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{overflowY: "auto", height: "100%"}}
        >
            {children}
        </div>
    );
};

export default AutoScrollToBottom;
