// ScrollDownButton.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useChatContext } from '@/app/[上下文]/ChatContext';
import { usePathname } from 'next/navigation';

interface ScrollDownButtonProps {
    className?: string;
    isSidebarOpen: boolean;
    sidebarWidth: number;
}

// 在文件顶部添加类型声明
type ExtendedEventListenerOptions = EventListenerOptions & {
    passive?: boolean;
};

const ScrollDownButton: React.FC<ScrollDownButtonProps> = ({ className, isSidebarOpen, sidebarWidth }) => {
    const { isStreaming } = useChatContext();
    const [show, setShow] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const lastScrollY = useRef(0);
    const animationFrame = useRef<number>();
    const autoScrollTimeout = useRef<NodeJS.Timeout>();
    const initialScrollTimeout = useRef<NodeJS.Timeout>();
    const isProgrammaticScroll = useRef(false); // 标识是否为程序化滚动

    const userInteractionHandler = useRef<() => void>();

    const pathname = usePathname();
    const lastPathRef = useRef(pathname);

    const checkShouldShow = useCallback((container: Element) => {
        const currentScrollY = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        const hasScrollSpace = scrollHeight > clientHeight + 100;
        const isNotAtBottom = currentScrollY < scrollHeight - clientHeight - 50;
        
        setShow(hasScrollSpace && isNotAtBottom);
        lastScrollY.current = currentScrollY;
    }, []);

    const easeInOutQuad = (t: number): number => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const cancelScroll = useCallback(() => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = undefined;
        }
        setIsScrolling(false);
        isProgrammaticScroll.current = false;
        if (userInteractionHandler.current) {
            const handler = userInteractionHandler.current;
            window.removeEventListener('wheel', handler);
            window.removeEventListener('touchstart', handler);
            window.removeEventListener('keydown', handler);
            userInteractionHandler.current = undefined;
        }
    }, []);

    const smoothScroll = useCallback((
        container: Element,
        start: number,
        end: number,
        duration: number,
        isAutoScroll: boolean = false
    ) => {
        setIsScrolling(true);
        isProgrammaticScroll.current = true; // 设置为程序化滚动
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = easeInOutQuad(progress);
            const currentPosition = start + (end - start) * easeProgress;
            
            container.scrollTop = currentPosition;
            
            if (progress < 1 && !isProgrammaticScroll.current) {
                setIsScrolling(false);
                animationFrame.current = undefined;
                return;
            }

            if (progress < 1) {
                animationFrame.current = requestAnimationFrame(animate);
            } else {
                setIsScrolling(false);
                isProgrammaticScroll.current = false; // 重置程序化滚动标志
                animationFrame.current = undefined;
                if (userInteractionHandler.current) {
                    const handler = userInteractionHandler.current;
                    window.removeEventListener('wheel', handler);
                    window.removeEventListener('touchstart', handler);
                    window.removeEventListener('keydown', handler);
                    userInteractionHandler.current = undefined;
                }
            }
        };

        const handleUserInteraction = () => {
            cancelScroll();
        };

        userInteractionHandler.current = handleUserInteraction;

        window.addEventListener('wheel', handleUserInteraction, { 
            passive: true 
        } as ExtendedEventListenerOptions);
        window.addEventListener('touchstart', handleUserInteraction, { 
            passive: true 
        } as ExtendedEventListenerOptions);
        window.addEventListener('keydown', handleUserInteraction, { 
            passive: true 
        } as ExtendedEventListenerOptions);

        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
        animationFrame.current = requestAnimationFrame(animate);
    }, [cancelScroll]);

    const scrollToBottom = useCallback((container: Element, isAuto: boolean = false) => {
        const currentPosition = container.scrollTop;
        const targetPosition = container.scrollHeight - container.clientHeight;
        const distance = targetPosition - currentPosition;
        
        if (distance <= 0) return;

        let duration;
        if (isStreaming) {
            // 流式状态下使用适中的滚动速度
            duration = Math.min(Math.max(300, distance / 3), 1000);
        } else {
            // 普通状态下使用正常滚动速度
            duration = Math.min(Math.max(300, distance / 3), 700);
        }

        smoothScroll(container, currentPosition, targetPosition, duration, isAuto);
    }, [smoothScroll, isStreaming]);

    const shouldScrollToBottom = useCallback((container: Element) => {
        // 检查是否有足够的滚动空间
        const hasEnoughScrollSpace = container.scrollHeight > container.clientHeight + 100;
        
        // 检查是否在顶部或接近顶部
        const isNearTop = container.scrollTop < 100;
        
        // 检查路径是否发生变化
        const pathChanged = lastPathRef.current !== pathname;
        
        // 更新上次路径
        lastPathRef.current = pathname;
        
        return hasEnoughScrollSpace && (isNearTop || pathChanged);
    }, [pathname]);

    useEffect(() => {
        const scrollContainer = document.querySelector('section.flex-1.overflow-auto');
        if (!scrollContainer) return;

        // 初始加载或路径变化时的滚动处理
        initialScrollTimeout.current = setTimeout(() => {
            if (shouldScrollToBottom(scrollContainer)) {
                scrollToBottom(scrollContainer);
            }
        }, 800);

        const handleScroll = () => {
            if (!scrollContainer) return;

            checkShouldShow(scrollContainer);

            // 在流式状态下，如果用户在底部或接近底部，继续自动滚动
            if (isStreaming) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                // 增加判断范围，使其更容易触发自动滚动
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                if (isNearBottom || scrollTop === 0) { // 添加对顶部位置的判断
                    if (autoScrollTimeout.current) {
                        clearTimeout(autoScrollTimeout.current);
                    }
                    autoScrollTimeout.current = setTimeout(() => {
                        scrollToBottom(scrollContainer, true);
                    }, 100); // 减少延迟时间
                }
            }
        };

        const handleContentChange = () => {
            if (!isStreaming) return;
            
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            
            // 如果用户在底部或未滚动，则自动滚动
            if (isNearBottom || scrollTop === 0) {
                if (autoScrollTimeout.current) {
                    clearTimeout(autoScrollTimeout.current);
                }
                autoScrollTimeout.current = setTimeout(() => {
                    scrollToBottom(scrollContainer, true);
                }, 100); // 减少延迟时间
            }
        };

        const observer = new MutationObserver(handleContentChange);
        observer.observe(scrollContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // 添加即时的内容变化检查
        if (isStreaming) {
            handleContentChange();
        }

        scrollContainer.addEventListener('scroll', handleScroll);
        checkShouldShow(scrollContainer);

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            cancelScroll();
            if (autoScrollTimeout.current) {
                clearTimeout(autoScrollTimeout.current);
            }
            if (initialScrollTimeout.current) {
                clearTimeout(initialScrollTimeout.current);
            }
        };
    }, [checkShouldShow, scrollToBottom, isStreaming, cancelScroll, shouldScrollToBottom, pathname]);

    const handleClick = useCallback(() => {
        const scrollContainer = document.querySelector('section.flex-1.overflow-auto');
        if (!scrollContainer) return;

        scrollToBottom(scrollContainer);
    }, [scrollToBottom]);

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
            style={{
                left: isSidebarOpen ? `calc(50% + ${sidebarWidth / 2}px)` : '50%',
                transform: isSidebarOpen ? 'translateX(-50%)' : '-translate-x-1/2',
            }}
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
};

export default ScrollDownButton;
