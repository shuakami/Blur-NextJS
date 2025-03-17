import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 创建一个防抖函数hook
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟时间(ms)
 * @returns 防抖处理后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            fn(...args);
        }, delay);
    }, [fn, delay]);
}

/**
 * 创建一个防抖值hook
 * @param value 需要防抖的值
 * @param delay 防抖延迟时间(ms)
 * @returns 防抖处理后的值
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    
    return debouncedValue;
}