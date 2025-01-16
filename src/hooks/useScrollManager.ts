import { useCallback, useRef, useState } from 'react';

const SCROLL_CONTAINER = '.flex-1.overflow-auto.w-full.pt-12';

export const useScrollManager = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

    const scrollToBottom = useCallback(() => {
        if (!autoScrollEnabled) return;

        // 优先使用直接容器
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            });
            return;
        }

        // 回退到使用选择器
        const scrollContainer = document.querySelector(SCROLL_CONTAINER);
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [autoScrollEnabled]);

    const handleScroll = useCallback(() => {
        if (containerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
            if (scrollHeight - scrollTop > clientHeight + 50) {
                setAutoScrollEnabled(false);
            } else {
                setAutoScrollEnabled(true);
            }
        }
    }, []);

    return {
        containerRef,
        scrollToBottom,
        handleScroll,
        autoScrollEnabled
    };
}; 