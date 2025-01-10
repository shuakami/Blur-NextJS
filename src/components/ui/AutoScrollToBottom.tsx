import React, { useLayoutEffect } from "react";
import { useRouter } from 'next/router';
import { useScrollManager } from "@/hooks/useScrollManager";

interface AutoScrollToBottomProps {
    children: React.ReactNode;
    trigger?: any; // 用于检测新消息触发自动滚动
}

const AutoScrollToBottom: React.FC<AutoScrollToBottomProps> = ({children, trigger}) => {
    const { containerRef, scrollToBottom, handleScroll } = useScrollManager();
    const router = useRouter();
    const { pathname } = router;

    // 使用 useLayoutEffect 代替 useEffect，以便在 DOM 更新后立即执行滚动操作
    useLayoutEffect(() => {
        scrollToBottom();
    }, [trigger, pathname, scrollToBottom]); // 当 trigger / url 变化时自动滚动

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
