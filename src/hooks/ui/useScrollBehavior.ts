import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Message } from '@/types/stream';

/**
 * 处理聊天列表的滚动行为
 * @param messagesEndRef 消息列表末尾的引用
 * @param messages 消息数组
 * @param isStreaming 是否正在流式传输
 */
export const useScrollBehavior = (
    messagesEndRef: React.RefObject<HTMLDivElement>,
    messages: Message[],
    isStreaming: boolean
) => {
    const userInteractedRef = useRef(false);
    const lastScrollTime = useRef(0);
    const pathname = usePathname();
    const lastPathRef = useRef(pathname);

    useEffect(() => {
        if (messages.length === 0) return;
        
        const scrollContainer = document.querySelector('.flex-1.overflow-auto.w-full.pt-12');
        if (!scrollContainer) return;

        const isPathChanged = lastPathRef.current !== pathname;
        lastPathRef.current = pathname;

        // 节流处理
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime.current < 50) return;
            lastScrollTime.current = now;

            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
            
            if (isAtBottom) {
                userInteractedRef.current = false;
            }
        };

        const handleUserInteraction = (e: Event) => {
            if (!e.isTrusted) return;
            userInteractedRef.current = true;
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        scrollContainer.addEventListener('wheel', handleUserInteraction, { passive: true });
        scrollContainer.addEventListener('touchstart', handleUserInteraction, { passive: true });

        if (isPathChanged || !userInteractedRef.current || (isStreaming && !userInteractedRef.current)) {
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: isPathChanged ? 'instant' : 'smooth'
                });
            });
        }

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            scrollContainer.removeEventListener('wheel', handleUserInteraction);
            scrollContainer.removeEventListener('touchstart', handleUserInteraction);
        };
    }, [messages, pathname, isStreaming, messagesEndRef]);
}; 