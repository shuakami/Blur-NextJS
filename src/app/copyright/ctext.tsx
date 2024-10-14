"use client";

import React, {useEffect, useState} from 'react';
import Encode from "@/app/copyright/encode";
import useTranslation from "@/hooks/useTranslation";
import Cookies from 'js-cookie';
import Link from 'next/link';
import {useThemeContext} from "@/theme/ThemeContext";

const CText: React.FC = () => {
    const {theme} = useThemeContext();
    const version = process.env.NEXT_PUBLIC_VERSION as string;
    const {t} = useTranslation();
    const [showBlueDot, setShowBlueDot] = useState<boolean>(false);

    useEffect(() => {
        // 检查用户是否已经查看了当前版本的更新日志
        const viewedVersion = Cookies.get('viewed_version');
        if (viewedVersion !== version) {
            setShowBlueDot(true);
        }
    }, [version]);

    const handleVersionClick = () => {
        // 用户点击版本号，设置 cookie 并隐藏小蓝点
        Cookies.set('viewed_version', version, {expires: 365});
        setShowBlueDot(false);
    };

    return (
        <>
            <Encode/>
            <div className="text-center text-xs text-black/60 dark:text-[#b2b2b2]/90 mt-2">
                <Link
                    href={`/update/${version}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span
                        onClick={handleVersionClick}
                        className="relative text-black/50 dark:text-[#b2b2b2]/80 hover:text-black/80 dark:hover:text-[#b2b2b2]/60 cursor-pointer"
                    >
                        {version}
                        {showBlueDot && (
                            <span className={`absolute w-1 h-1  ${theme.bg(500)} rounded-full select-none`}></span>
                        )}
                    </span>
                </Link>
                &nbsp;-&nbsp;
                <span className="text-black/50 dark:text-[#b2b2b2]/80">
                    {t('Blur 也可能会犯错哦。请注意检查消息是否正确。')}
                </span>
            </div>
        </>
    );
};

export default CText;
