'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { themeColors } from './themeColors';
import Cookies from 'js-cookie';

type ThemeColor = 'primary' | 'secondary';
type ThemeWeight = number | undefined;

interface ThemeFunctions {
  ring: (weight?: ThemeWeight, color?: ThemeColor) => string;
  border: (weight?: ThemeWeight, color?: ThemeColor) => string;
  bg: (weight?: ThemeWeight, color?: ThemeColor) => string;
  hover: (color?: ThemeColor) => string;
  shadow: (strength?: number) => string;
}

interface ThemeContextProps {
  theme: ThemeFunctions;
  themeName: string;
  setThemeName: (name: string) => void;
}

const createDefaultThemeFunctions = (): ThemeFunctions => ({
  ring: () => '',
  border: () => '',
  bg: () => '',
  hover: () => '',
  shadow: () => '',
});

const ThemeContext = createContext<ThemeContextProps>({
  theme: createDefaultThemeFunctions(),
  themeName: 'default',
  setThemeName: () => {},
});

// 移除 Hook，改为普通函数
const getClassName = (mode: any, type: string, weight?: ThemeWeight, color: ThemeColor = 'primary'): string => {
  const [baseColor, baseWeight] = mode[color].split('-');
  const colorWeight = weight || baseWeight;
  return `${type}-${baseColor}-${colorWeight}`;
};

export const LXHThemeProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const { resolvedTheme } = useNextTheme();
  const [themeName, setThemeName] = useState(() => Cookies.get('themeName') || 'default');

  const theme = useMemo(() => {
    const currentThemeColors = themeColors[themeName] || themeColors.default;
    const mode = resolvedTheme === 'dark' ? currentThemeColors.dark : currentThemeColors.light;
    
    return {
      ring: (weight?: ThemeWeight, color?: ThemeColor) => 
        getClassName(mode, 'ring', weight, color),
      border: (weight?: ThemeWeight, color?: ThemeColor) => 
        getClassName(mode, 'border', weight, color),
      bg: (weight?: ThemeWeight, color?: ThemeColor) => 
        getClassName(mode, 'bg', weight, color),
      hover: (color: ThemeColor = 'primary') => 
        `hover:${getClassName(mode, 'bg', undefined, color)}`,
      shadow: (strength: number = 500) => 
        `shadow-${strength}`,
    };
  }, [themeName, resolvedTheme]);

  const handleThemeChange = useCallback((name: string) => {
    setThemeName(name);
    Cookies.set('themeName', name, { expires: 365 });
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    themeName,
    setThemeName: handleThemeChange
  }), [theme, themeName, handleThemeChange]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {React.Children.only(children)}
    </ThemeContext.Provider>
  );
}, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children;
});

LXHThemeProvider.displayName = 'LXHThemeProvider';

export const useThemeContext = () => useContext(ThemeContext);