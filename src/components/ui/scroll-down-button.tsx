import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useChatContext } from '@/app/[上下文]/ChatContext';
import { usePathname } from 'next/navigation';

interface ScrollDownButtonProps {
    className?: string; // 自定义类名
    isSidebarOpen: boolean; // 侧边栏是否打开
    sidebarWidth: number; // 侧边栏宽度
}

// 扩展事件监听选项
type ExtendedEventListenerOptions = EventListenerOptions & {
    passive?: boolean; // 被动监听
};

// 缓动动画
const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

// 滚动到底部按钮组件
const ScrollDownButton: React.FC<ScrollDownButtonProps> = memo(({ className, isSidebarOpen, sidebarWidth }) => {
    const { isStreaming } = useChatContext(); // 获取聊天上下文
    const [show, setShow] = useState(false); // 控制按钮显示
    const [isScrolling, setIsScrolling] = useState(false); // 控制滚动状态
    
    // 合并相关的 ref
    const scrollState = useRef({
        lastScrollY: 0,
        animationFrame: 0,
        autoScrollTimeout: undefined as NodeJS.Timeout | undefined,
        initialScrollTimeout: undefined as NodeJS.Timeout | undefined,
        isProgrammaticScroll: false,
        userInteractionHandler: undefined as (() => void) | undefined,
    });

    const pathname = usePathname();
    const lastPathRef = useRef(pathname);

    // 检查按钮是否显示
    const checkShouldShow = useCallback((container: Element) => {
        const currentScrollY = container.scrollTop;
        const { scrollHeight, clientHeight } = container;
        
        const hasScrollSpace = scrollHeight > clientHeight + 100;
        const isNotAtBottom = currentScrollY < scrollHeight - clientHeight - 50;
        
        setShow(hasScrollSpace && isNotAtBottom);
        scrollState.current.lastScrollY = currentScrollY;
    }, []);

    // 取消滚动
    const cancelScroll = useCallback(() => {
        const state = scrollState.current;
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
            state.animationFrame = 0;
        }
        setIsScrolling(false);
        state.isProgrammaticScroll = false;
        if (state.userInteractionHandler) {
            const handler = state.userInteractionHandler;
            window.removeEventListener('wheel', handler);
            window.removeEventListener('touchstart', handler);
            window.removeEventListener('keydown', handler);
            state.userInteractionHandler = undefined;
        }
    }, []);

    // 平滑滚动
    const smoothScroll = useCallback((
        container: Element,
        start: number,
        end: number,
        duration: number,
        isAutoScroll: boolean = false
    ) => {
        const state = scrollState.current;
        setIsScrolling(true);
        state.isProgrammaticScroll = true;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = easeInOutQuad(progress);
            const currentPosition = start + (end - start) * easeProgress;
            
            container.scrollTop = currentPosition;
            
            if (progress < 1 && !state.isProgrammaticScroll) {
                setIsScrolling(false);
                state.animationFrame = 0;
                return;
            }

            if (progress < 1) {
                state.animationFrame = requestAnimationFrame(animate);
            } else {
                setIsScrolling(false);
                state.isProgrammaticScroll = false;
                state.animationFrame = 0;
                if (state.userInteractionHandler) {
                    const handler = state.userInteractionHandler;
                    window.removeEventListener('wheel', handler);
                    window.removeEventListener('touchstart', handler);
                    window.removeEventListener('keydown', handler);
                    state.userInteractionHandler = undefined;
                }
            }
        };

        const handleUserInteraction = () => {
            cancelScroll();
        };

        state.userInteractionHandler = handleUserInteraction;

        const listenerOptions = { passive: true } as ExtendedEventListenerOptions;
        window.addEventListener('wheel', handleUserInteraction, listenerOptions);
        window.addEventListener('touchstart', handleUserInteraction, listenerOptions);
        window.addEventListener('keydown', handleUserInteraction, listenerOptions);

        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
        }
        state.animationFrame = requestAnimationFrame(animate);
    }, [cancelScroll]);

    // 滚动到底部
    const scrollToBottom = useCallback((container: Element, isAuto: boolean = false) => {
        const currentPosition = container.scrollTop;
        const targetPosition = container.scrollHeight - container.clientHeight;
        const distance = targetPosition - currentPosition;
        
        if (distance <= 0) return;

        const duration = isStreaming
            ? Math.min(Math.max(300, distance / 3), 1000)
            : Math.min(Math.max(300, distance / 3), 700);

        smoothScroll(container, currentPosition, targetPosition, duration, isAuto); // 执行平滑滚动
    }, [smoothScroll, isStreaming]);

    // 判断是否需要滚动到底部
    const shouldScrollToBottom = useCallback((container: Element) => {
        const hasEnoughScrollSpace = container.scrollHeight > container.clientHeight + 100;
        const isNearTop = container.scrollTop < 100;
        const pathChanged = lastPathRef.current !== pathname;
        lastPathRef.current = pathname;
        
        return hasEnoughScrollSpace && (isNearTop || pathChanged);
    }, [pathname]);

    useEffect(() => {
        const scrollContainer = document.querySelector('section.flex-1.overflow-auto');
        if (!scrollContainer) return;

        const state = scrollState.current;

        state.initialScrollTimeout = setTimeout(() => {
            if (shouldScrollToBottom(scrollContainer)) {
                scrollToBottom(scrollContainer);
                setTimeout(() => scrollToBottom(scrollContainer), 300);
            }
        }, 1200);

        // 处理滚动事件
        const handleScroll = () => {
            if (!scrollContainer) return;
            checkShouldShow(scrollContainer);

            if (isStreaming) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                if (isNearBottom || scrollTop === 0) {
                    if (state.autoScrollTimeout) {
                        clearTimeout(state.autoScrollTimeout);
                    }
                    state.autoScrollTimeout = setTimeout(() => {
                        scrollToBottom(scrollContainer, true);
                    }, 100);
                }
            }
        };

        // 处理内容变化
        const handleContentChange = () => {
            if (!isStreaming) return; // 如果不在流式状态则返回
            
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            
            if (isNearBottom || scrollTop === 0) {
                if (state.autoScrollTimeout) {
                    clearTimeout(state.autoScrollTimeout);
                }
                state.autoScrollTimeout = setTimeout(() => {
                    scrollToBottom(scrollContainer, true);
                }, 100);
            }
        };

        const observer = new MutationObserver(handleContentChange);
        observer.observe(scrollContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // 流式自动划
        if (isStreaming) {
            handleContentChange();
        }

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        checkShouldShow(scrollContainer);

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            cancelScroll();
            if (state.autoScrollTimeout) {
                clearTimeout(state.autoScrollTimeout);
            }
            if (state.initialScrollTimeout) {
                clearTimeout(state.initialScrollTimeout);
            }
        };
    }, [checkShouldShow, scrollToBottom, isStreaming, cancelScroll, shouldScrollToBottom, pathname]);

    // 处理按钮点击事件
    const handleClick = useCallback(() => {
        const scrollContainer = document.querySelector('section.flex-1.overflow-auto');
        if (scrollContainer) {
            scrollToBottom(scrollContainer);
        }
    }, [scrollToBottom]);

    // 按钮样式
    const buttonStyle = {
        left: isSidebarOpen ? `calc(50% + ${sidebarWidth / 2}px)` : '50%',
        transform: isSidebarOpen ? 'translateX(-50%)' : '-translate-x-1/2',
    };

    return (
        <button 
            onClick={handleClick}
            className={`
                absolute z-50 bottom-[109px]
                left-1/2 transform -translate-x-1/2
                w-8 h-8 rounded-full 
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700 
                flex items-center justify-center 
                transition-all duration-400
                hover:bg-gray-50 dark:hover:bg-gray-700 
                hover:scale-100 hover:-translate-y-0.5
                opacity-0 pointer-events-none
                ${show ? 'opacity-100 pointer-events-auto' : ''}
                ${isScrolling ? 'animate-scroll-down' : ''}
                ${className || ''}
            `}
            style={buttonStyle}
            aria-label="滚动到底部"
        >
            <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className={`
                    text-gray-700 dark:text-gray-200
                    transition-transform duration-200
                    ${isScrolling ? 'animate-arrow-down' : ''}
                `}
            >
                <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" 
                    fill="currentColor"
                />
            </svg>
        </button>
    );
});

ScrollDownButton.displayName = 'ScrollDownButton';

export default ScrollDownButton;