"use client";

import React, { useEffect, useState, memo } from 'react';
import Link from 'next/link';
import useTranslation from '../../hooks/i18n/useTranslation';
import { useThemeContext } from "@/theme/ThemeContext";

// 版本号显示组件
const VersionDisplay = memo(({ version, showBlueDot, theme, onClick }: {
  version: string;
  showBlueDot: boolean;
  theme: any;
  onClick: (e: React.MouseEvent) => void;
}) => (
  <Link 
    href={{
      pathname: `/update/${version}`
    }}
    target="_blank"
    onClick={onClick}
    className="relative text-black/50 dark:text-[#b2b2b2]/80 hover:text-black/80 dark:hover:text-[#b2b2b2]/60"
  >
    {version}
    {showBlueDot && (
      <span 
        className={`absolute w-1 h-1 ${theme.bg(500)} rounded-full select-none`}
        aria-hidden="true"
      />
    )}
  </Link>
));

VersionDisplay.displayName = 'VersionDisplay';

// 主组件
const CText = () => {
  const { theme } = useThemeContext();
  const version = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  const { t } = useTranslation();
  
  const [showBlueDot, setShowBlueDot] = useState(false);

  // 检查本地存储的版本
  useEffect(() => {
    const lastVersion = localStorage.getItem('last_version');
    setShowBlueDot(lastVersion !== version);
  }, [version]);

  // 处理版本点击
  const handleVersionClick = (e: React.MouseEvent) => {
    localStorage.setItem('last_version', version);
    setShowBlueDot(false);
  };

  return (
    <div className="text-center text-[0.7rem] sm:text-xs text-black/60 dark:text-[#b2b2b2]/90">
      <VersionDisplay 
        version={version}
        showBlueDot={showBlueDot}
        theme={theme}
        onClick={handleVersionClick}
      />
      <span className="mx-1">-</span>
      <span className="text-black/50 dark:text-[#b2b2b2]/80">
        {t('Blur 也可能会犯错哦。请注意检查消息是否正确。')}
      </span>
    </div>
  );
};

export default memo(CText);