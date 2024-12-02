"use client";

import React, {useEffect, useState, useCallback} from 'react';
import dynamic from 'next/dynamic';
import useTranslation from "@/hooks/useTranslation";
import Cookies from 'js-cookie';
import {useThemeContext} from "@/theme/ThemeContext";

// 类型定义
interface VersionState {
  showBlueDot: boolean;
  isUpdateModalOpen: boolean;
}

// 动态导入
const UpdateModal = dynamic(() => import("@/components/UpdateModal"), {
  ssr: false,
  loading: () => null
});

// 版本检查 Hook
const useVersionCheck = (version: string) => {
  const [showBlueDot, setShowBlueDot] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const shouldShowModal = params.get('UpdateModal') === 'true';
      const viewedVersion = Cookies.get('viewed_version');
      
      setShowBlueDot(viewedVersion !== version);
      setIsUpdateModalOpen(shouldShowModal);
    } catch (error) {
      console.error('Version check failed:', error);
    }
  }, [version]);

  return {
    showBlueDot,
    isUpdateModalOpen,
    setShowBlueDot,
    setIsUpdateModalOpen
  };
};

// URL 处理 Hook
const useUrlHandler = () => {
  return useCallback((shouldShow: boolean) => {
    try {
      const url = new URL(window.location.href);
      if (shouldShow) {
        url.searchParams.set('UpdateModal', 'true');
      } else {
        url.searchParams.delete('UpdateModal');
      }
      window.history.pushState({}, '', url.toString());
    } catch (error) {
      console.error('URL update failed:', error);
    }
  }, []);
};

const CText: React.FC = () => {
  const {theme} = useThemeContext();
  const version = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  const {t} = useTranslation();
  
  const {
    showBlueDot,
    isUpdateModalOpen,
    setShowBlueDot,
    setIsUpdateModalOpen
  } = useVersionCheck(version);
  
  const updateUrl = useUrlHandler();

  // 处理版本点击
  const handleVersionClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    updateUrl(true);
    Cookies.set('viewed_version', version, {expires: 365});
    setShowBlueDot(false);
    setIsUpdateModalOpen(true);
  }, [version, updateUrl, setShowBlueDot, setIsUpdateModalOpen]);

  // 处理模态框关闭
  const handleCloseModal = useCallback(() => {
    updateUrl(false);
    setIsUpdateModalOpen(false);
  }, [updateUrl, setIsUpdateModalOpen]);

  return (
    <>
      <div className="text-center text-[0.7rem] sm:text-xs text-black/60 dark:text-[#b2b2b2]/90">
        <span
          onClick={handleVersionClick}
          className="relative text-black/50 dark:text-[#b2b2b2]/80 hover:text-black/80 dark:hover:text-[#b2b2b2]/60 cursor-pointer"
        >
          {version}
          {showBlueDot && (
            <span 
              className={`absolute w-1 h-1 ${theme.bg(500)} rounded-full select-none`}
              aria-hidden="true"
            />
          )}
        </span>
        <span className="mx-1">-</span>
        <span className="text-black/50 dark:text-[#b2b2b2]/80">
          {t('Blur 也可能会犯错哦。请注意检查消息是否正确。')}
        </span>
      </div>

      {isUpdateModalOpen && (
        <UpdateModal 
          isOpen={isUpdateModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};

export default CText;