"use client";

import React, {useEffect, useState, useCallback} from 'react';
import dynamic from 'next/dynamic';
import useTranslation from "@/hooks/useTranslation";
import Cookies from 'js-cookie';
import {useThemeContext} from "@/theme/ThemeContext";

const UpdateModal = dynamic(() => import("@/components/UpdateModal"), {
    ssr: false,
    loading: () => null
});

// 提取版本检查逻辑
const useVersionCheck = (version: string) => {
    const [state, setState] = useState({
        showBlueDot: false,
        isUpdateModalOpen: false
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shouldShowModal = params.get('UpdateModal') === 'true';
        const viewedVersion = Cookies.get('viewed_version');
        
        setState({
            showBlueDot: viewedVersion !== version,
            isUpdateModalOpen: shouldShowModal
        });
    }, [version]);

    return {
        ...state,
        setShowBlueDot: useCallback((show: boolean) => 
            setState(prev => ({...prev, showBlueDot: show})), []),
        setIsUpdateModalOpen: useCallback((open: boolean) => 
            setState(prev => ({...prev, isUpdateModalOpen: open})), [])
    };
};

// 提取 URL 处理逻辑
const useUrlHandler = () => {
    const updateUrl = useCallback((shouldShow: boolean) => {
        const url = new URL(window.location.href);
        if (shouldShow) {
            url.searchParams.set('UpdateModal', 'true');
        } else {
            url.searchParams.delete('UpdateModal');
        }
        window.history.pushState({}, '', url.toString());
    }, []);

    return updateUrl;
};

const CText: React.FC = () => {
    const {theme} = useThemeContext();
    const version = process.env.NEXT_PUBLIC_VERSION as string;
    const {t} = useTranslation();
    
    const {
        showBlueDot, 
        isUpdateModalOpen, 
        setShowBlueDot, 
        setIsUpdateModalOpen
    } = useVersionCheck(version);
    
    const updateUrl = useUrlHandler();

    const handleVersionClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        updateUrl(true);
        Cookies.set('viewed_version', version, {expires: 365});
        setShowBlueDot(false);
        setIsUpdateModalOpen(true);
    }, [version, updateUrl, setShowBlueDot, setIsUpdateModalOpen]);

    const handleCloseModal = useCallback(() => {
        updateUrl(false);
        setIsUpdateModalOpen(false);
    }, [updateUrl, setIsUpdateModalOpen]);

    // 优化渲染内容
    const content = (
        <div className="text-center text-xs text-black/60 dark:text-[#b2b2b2]/90 mt-2">
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
            &nbsp;-&nbsp;
            <span className="text-black/50 dark:text-[#b2b2b2]/80">
                {t('Blur 也可能会犯错哦。请注意检查消息是否正确。')}
            </span>
        </div>
    );

    return (
        <>
            {content}
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