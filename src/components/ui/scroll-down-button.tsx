import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useChatContext } from '@/app/[上下文]/ChatContext';

interface ScrollDownButtonProps {
    className?: string;
}

// 在文件顶部添加类型声明
type ExtendedEventListenerOptions = EventListenerOptions & {
    passive?: boolean;
};

const ScrollDownButton: React.FC<ScrollDownButtonProps> = ({ className }) => {
    const { isStreaming } = useChatContext();
    const [show, setShow] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const lastScrollY = useRef(0);
    const animationFrame = useRef<number>();
    const autoScrollTimeout = useRef<NodeJS.Timeout>();
    const initialScrollTimeout = useRef<NodeJS.Timeout>();
    const isProgrammaticScroll = useRef(false); // 标识是否为程序化滚动

    const userInteractionHandler = useRef<() => void>();

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

    useEffect(() => {
        const scrollContainer = document.querySelector('section.flex-1.overflow-auto');
        if (!scrollContainer) return;

        // 初始加载时使用平滑滚动到底部
        initialScrollTimeout.current = setTimeout(() => {
            const targetPosition = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            scrollToBottom(scrollContainer);
        }, 600);

        const handleScroll = () => {
            if (!scrollContainer) return;

            checkShouldShow(scrollContainer);

            // 在流式状态下，如果用户滚动到底部，继续自动滚动
            if (isStreaming) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
                
                if (isNearBottom) {
                    if (autoScrollTimeout.current) {
                        clearTimeout(autoScrollTimeout.current);
                    }
                    autoScrollTimeout.current = setTimeout(() => {
                        scrollToBottom(scrollContainer, true);
                    }, 600);
                }
            }
        };

        const handleContentChange = () => {
            if (isStreaming) {
                if (autoScrollTimeout.current) {
                    clearTimeout(autoScrollTimeout.current);
                }
                autoScrollTimeout.current = setTimeout(() => {
                    scrollToBottom(scrollContainer, true);
                }, 600);
            }
        };

        const observer = new MutationObserver(handleContentChange);
        observer.observe(scrollContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });

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
    }, [checkShouldShow, scrollToBottom, isStreaming, cancelScroll]);

    const handleClick = useCallback(() => {
        const scrollContainer = document.querySelector('section.flex-1.overflow-auto');
        if (!scrollContainer) return;

        scrollToBottom(scrollContainer);
    }, [scrollToBottom]);

    return (
        <button 
            onClick={handleClick}
            className={`
                fixed z-50 left-1/2 -translate-x-1/2 bottom-[105px]
                w-8 h-8 rounded-full 
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700 
                shadow-lg 
                flex items-center justify-center 
                transition-all duration-200 
                hover:bg-gray-50 dark:hover:bg-gray-700 
                hover:scale-105 hover:-translate-y-0.5
                opacity-0 data-[show=true]:opacity-100
                ${isScrolling ? 'animate-scroll-down' : ''}
                ${className || ''}
            `}
            data-show={show}
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
