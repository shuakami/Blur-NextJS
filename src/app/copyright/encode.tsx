import {useUser} from "@clerk/nextjs";
import {memo, useCallback, useEffect, useMemo, useRef} from "react";

// 预定义常量
const OPACITY = 0.015;
const COLOR_CACHE = new Map<string, string>();

// 颜色计算函数
const getColorValue = (char: string, isDark: boolean): string => {
    const cacheKey = `${char}-${isDark}`;
    
    if (COLOR_CACHE.has(cacheKey)) {
        return COLOR_CACHE.get(cacheKey)!;
    }
    
    const colorValue = char.charCodeAt(0) % 255;
    const value = isDark ? 255 - colorValue : colorValue;
    const rgba = `rgba(${value},${value},${value},${OPACITY})`;
    
    COLOR_CACHE.set(cacheKey, rgba);
    return rgba;
};

const Encode = memo(() => {
    const {user} = useUser();
    const userId = useMemo(() => user?.id || 'No Login', [user?.id]);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 使用 RAF 优化主题检测
    const checkDarkMode = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        
        requestAnimationFrame(() => {
            const isDark = document.documentElement.classList.contains('dark');
            const chars = userId.split('');
            const spans = chars.map(char => {
                const rgba = getColorValue(char, isDark);
                return `<span style="color:${rgba}">${char}</span>`;
            });
            
            container.innerHTML = spans.join('');
        });
    }, [userId]);

    useEffect(() => {
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [checkDarkMode]);

    return (
        <div 
            ref={containerRef}
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1000,
            }}
        />
    );
});

Encode.displayName = 'Encode';

export default Encode;