import React, {useEffect, useRef, useState} from "react";

interface AutoScrollToBottomProps {
    children: React.ReactNode;
    trigger?: any; // 用于检测新消息触发自动滚动
}

const AutoScrollToBottom: React.FC<AutoScrollToBottomProps> = ({children, trigger}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const scrollThreshold = 190; // 定义滚动阈值，越小越灵敏，越大越滞后

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
            // 判断距离底部的距离，超过阈值时不再自动滚动
            if (scrollHeight - scrollTop > clientHeight + scrollThreshold) {
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

