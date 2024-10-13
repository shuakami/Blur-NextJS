'use client';

import React, {createContext, useContext, useState, ReactNode, useMemo, useEffect} from 'react';
import {ThemeProvider as NextThemesProvider, useTheme as useNextTheme} from 'next-themes';
import {themeColors} from './themeColors';
import Cookies from 'js-cookie';  // 引入 js-cookie

interface ThemeContextProps {
    theme: {
        ring: (weight?: number, color?: 'primary' | 'secondary') => string;
        border: (weight?: number, color?: 'primary' | 'secondary') => string;
        bg: (weight?: number, color?: 'primary' | 'secondary') => string;
        hover: (color?: 'primary' | 'secondary') => string;
        shadow: (strength?: number) => string;
    };
    themeName: string;
    setThemeName: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
    theme: {
        ring: () => '',
        border: () => '',
        bg: () => '',
        hover: () => '',
        shadow: () => '',
    },
    themeName: 'default',
    setThemeName: () => {
    },
});

export const LXHThemeProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const {resolvedTheme} = useNextTheme();  // 获取当前的 light/dark 模式

    // 从 Cookie 中获取主题名，默认为 'default'
    const [themeName, setThemeName] = useState<string>(() => {
        return Cookies.get('themeName') || 'default';
    });

    const theme = useMemo(() => {
        const currentThemeColors = themeColors[themeName] || themeColors.default;
        const mode = resolvedTheme === 'dark' ? currentThemeColors.dark : currentThemeColors.light;

        // 生成可用的 TailwindCSS 类名
        const getClassName = (type: string, weight?: number, color: 'primary' | 'secondary' = 'primary') => {
            const [baseColor, baseWeight] = mode[color].split('-'); // 获取颜色基调和默认权重
            const colorWeight = weight || baseWeight; // 使用传递的权重或者默认权重
            return `${type}-${baseColor}-${colorWeight}`;
        };

        return {
            ring: (weight?: number, color?: 'primary' | 'secondary') => getClassName('ring', weight, color),
            border: (weight?: number, color?: 'primary' | 'secondary') => getClassName('border', weight, color),
            bg: (weight?: number, color?: 'primary' | 'secondary') => getClassName('bg', weight, color),
            hover: (color: 'primary' | 'secondary' = 'primary') => `hover:${getClassName('bg', undefined, color)}`,
            shadow: (strength: number = 500) => `shadow-${strength}`,
        };
    }, [themeName, resolvedTheme]);

    // 当主题名变化时，存储到 Cookie 中
    useEffect(() => {
        Cookies.set('themeName', themeName, {expires: 365});  // 设置 Cookie，有效期为一年
    }, [themeName]);

    return (
        <ThemeContext.Provider value={{theme, themeName, setThemeName}}>
            <NextThemesProvider>{children}</NextThemesProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
