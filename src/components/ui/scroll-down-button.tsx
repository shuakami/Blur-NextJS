import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useChatStateContext } from '@/app/[上下文]/ChatContext';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils/utils';

interface ScrollDownButtonProps {
    className?: string;
    isSidebarOpen: boolean;
    sidebarWidth: number;
}

const SCROLL_THRESHOLD = 100;
const BOTTOM_OFFSET = 50;
const SCROLL_CONTAINER = '.flex-1.overflow-auto.w-full.pt-12';

const easeInOutQuad = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const ScrollDownButton: React.FC<ScrollDownButtonProps> = memo(({ 
    className, 
    isSidebarOpen, 
    sidebarWidth 
}) => {
    const { isStreaming } = useChatStateContext();
    const [show, setShow] = useState(false);
    const lastCheckTime = useRef(0);
    const [isMobile, setIsMobile] = useState(false);
    
    const checkShouldShow = useCallback((container: Element) => {
        const now = Date.now();
        if (now - lastCheckTime.current < 50) return; // 50ms 节流
        lastCheckTime.current = now;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const hasScrollSpace = scrollHeight > clientHeight + SCROLL_THRESHOLD;
        const isNotAtBottom = scrollTop < scrollHeight - clientHeight - BOTTOM_OFFSET;
        
        setShow(hasScrollSpace && isNotAtBottom);
    }, []);

    useEffect(() => {
        const scrollContainer = document.querySelector(SCROLL_CONTAINER);
        if (!scrollContainer) return;

        const handleScroll = () => {
            requestAnimationFrame(() => checkShouldShow(scrollContainer));
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        checkShouldShow(scrollContainer);

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, [checkShouldShow]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleClick = useCallback(() => {
        const scrollContainer = document.querySelector(SCROLL_CONTAINER);
        if (!scrollContainer) return;
        
        const messagesEnd = scrollContainer.querySelector('div[class="h-1"]');
        if (messagesEnd) {
            messagesEnd.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <button 
            onClick={handleClick}
            className={cn(
                'fixed z-50 bottom-[109px]',
                'w-8 h-8 rounded-full',
                'bg-white dark:bg-gray-800',
                'border border-gray-200/50 dark:border-gray-700/50',
                'flex items-center justify-center',
                'transition-all duration-300 ease-in-out',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'hover:scale-105 hover:-translate-y-0.5',
                'group',
                'opacity-0 pointer-events-none',
                show && 'opacity-100 pointer-events-auto',
                className,
            )}
            style={{
                left: !isMobile && isSidebarOpen ? `calc(50% + ${sidebarWidth / 2}px)` : '50%',
                transform: 'translateX(-50%)',
            }}
            aria-label="滚动到底部"
        >
            <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className={cn(
                    'text-gray-700 dark:text-gray-200',
                    'transition-transform duration-200',
                    'group-hover:translate-y-0.5',
                    show && 'animate-bounce-subtle'
                )}
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