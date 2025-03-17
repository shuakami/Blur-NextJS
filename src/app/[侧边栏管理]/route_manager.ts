import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { debounce } from 'lodash';

// 常量定义
const CONSTANTS = {
    ROUTES: {
        CHAT_PATH: '/chat',
        BOOK_PATH: '/book',
        CHAT_REGEX: /\/chat\/([^\/]+)/,
        BOOK_REGEX: /\/book\/([^\/]+)/,
    },
    DEBOUNCE_WAIT: 100,
} as const;

// 类型定义
interface RouteState {
    currentId: string | null;
    mode: 'chat' | 'book';
}

export const useRouteManager = (
    mode: 'chat' | 'book' = 'chat',
    onSelect?: (id: string) => void,
    newItemId?: string | null
) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [routeState, setRouteState] = useState<RouteState>({
        currentId: null,
        mode
    });
    
    // 添加更新锁
    const isUpdatingRef = useRef(false);

    const debouncedUpdateRoute = useRef(
        debounce((id: string, source: string) => {
            console.log('[RouteManager] 执行路由更新:', {
                id,
                source,
                currentId: routeState.currentId,
                isUpdating: isUpdatingRef.current
            });

            if (isUpdatingRef.current) {
                console.log('[RouteManager] 跳过 - 正在更新');
                return;
            }

            isUpdatingRef.current = true;
            
            // 先更新状态
            setRouteState(prev => ({
                ...prev,
                currentId: id
            }));

            // 再更新路由
            const basePath = mode === 'book' ? CONSTANTS.ROUTES.BOOK_PATH : CONSTANTS.ROUTES.CHAT_PATH;
            startTransition(() => {
                router.push(`${basePath}/${id}`);
                onSelect?.(id);
                
                // 解锁要在router.push之后
                setTimeout(() => {
                    isUpdatingRef.current = false;
                }, 100);
            });
        }, CONSTANTS.DEBOUNCE_WAIT)
    ).current;

    const updateRoute = useCallback((id: string) => {
        if (id === routeState.currentId || isPending || isUpdatingRef.current) {
            return;
        }
        debouncedUpdateRoute(id, 'updateRoute');
    }, [routeState.currentId, isPending, debouncedUpdateRoute]);

    useEffect(() => {
        if (!pathname) return;
        
        const regex = mode === 'book' ? CONSTANTS.ROUTES.BOOK_REGEX : CONSTANTS.ROUTES.CHAT_REGEX;
        const matches = pathname.match(regex);

        if (matches) {
            const id = matches[1];
            // 只在ID不同且没有更新锁时触发
            if (id !== routeState.currentId && !isUpdatingRef.current) {
                if (mode === 'chat' && newItemId && newItemId !== routeState.currentId) {
                    debouncedUpdateRoute(newItemId, 'pathname-newItem');
                } else {
                    debouncedUpdateRoute(id, 'pathname');
                }
            }
        }
    }, [pathname, mode, routeState.currentId, newItemId, debouncedUpdateRoute]);

    useEffect(() => {
        return () => {
            debouncedUpdateRoute.cancel();
        };
    }, [debouncedUpdateRoute]);

    return {
        currentId: routeState.currentId,
        isRouting: isPending || isUpdatingRef.current,
        updateRoute
    };
};