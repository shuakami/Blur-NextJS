"use client";

import React, { useEffect, useState, memo, useCallback } from 'react';
import Link from 'next/link';
import useTranslation from '@/hooks/i18n/useTranslation';
import { useThemeContext } from "@/theme/ThemeContext";
import { Route } from 'next';

// 版本号显示组件
const VersionDisplay = memo(({ version, showBlueDot, theme, onClick }: {
  version: string;
  showBlueDot: boolean;
  theme: any;
  onClick: (e: React.MouseEvent) => void;
}) => {
  const linkStyle = React.useMemo(() => 
    "relative text-black/50 dark:text-[#b2b2b2]/80 hover:text-black/80 dark:hover:text-[#b2b2b2]/60"
  , []);

  const dotStyle = React.useMemo(() => 
    `absolute w-1 h-1 ${theme.bg(500)} rounded-full select-none`
  , [theme]);

  return (
    <Link 
      href={`/update/${version}` as Route}
      target="_blank"
      onClick={onClick}
      className={linkStyle}
    >
      {version}
      {showBlueDot && (
        <span 
          className={dotStyle}
          aria-hidden="true"
        />
      )}
    </Link>
  );
});

VersionDisplay.displayName = 'VersionDisplay';

// 使用 Context 来管理版本状态
const VersionContext = React.createContext<{
  version: string;
  showBlueDot: boolean;
  setShowBlueDot: (show: boolean) => void;
}>({
  version: '0.0.0',
  showBlueDot: false,
  setShowBlueDot: () => {},
});

// 版本状态 Provider
const VersionProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const version = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  const [showBlueDot, setShowBlueDot] = useState(() => {
    if (typeof window === 'undefined') return false;
    const lastVersion = localStorage.getItem('last_version');
    return lastVersion !== version;
  });

  const value = React.useMemo(() => ({
    version,
    showBlueDot,
    setShowBlueDot
  }), [version, showBlueDot]);

  return (
    <VersionContext.Provider value={value}>
      {children}
    </VersionContext.Provider>
  );
});

VersionProvider.displayName = 'VersionProvider';

// 主组件
const CText = memo(() => {
  const { theme } = useThemeContext();
  const { t } = useTranslation();
  const { version, showBlueDot, setShowBlueDot } = React.useContext(VersionContext);
  
  const handleVersionClick = useCallback((e: React.MouseEvent) => {
    localStorage.setItem('last_version', version);
    setShowBlueDot(false);
  }, [version, setShowBlueDot]);

  const containerStyle = React.useMemo(() => 
    "text-center text-[0.7rem] sm:text-xs text-black/60 dark:text-[#b2b2b2]/90"
  , []);

  const warningStyle = React.useMemo(() => 
    "text-black/50 dark:text-[#b2b2b2]/80"
  , []);

  return (
    <div className={containerStyle}>
      <VersionDisplay 
        version={version}
        showBlueDot={showBlueDot}
        theme={theme}
        onClick={handleVersionClick}
      />
      <span className="mx-1">-</span>
      <span className={warningStyle}>
        {t('Blur 也可能会犯错哦。请注意检查消息是否正确。')}
      </span>
    </div>
  );
});

CText.displayName = 'CText';

// 导出带 Provider 的组件
export default memo(function CTextWithProvider() {
  return (
    <VersionProvider>
      <CText />
    </VersionProvider>
  );
});