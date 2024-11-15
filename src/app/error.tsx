"use client";

import React, {useEffect, useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {AlertTriangle} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";

export default function Custom500() {
    const {t} = useTranslation(); // 使用 useTranslation 钩子
    const router = useRouter();
    const [randomErrorMessage, setRandomErrorMessage] = useState<string>('');
    const [errorDetails, setErrorDetails] = useState({
        userAgent: '',
        url: '',
        timestamp: '',
        referrer: ''
    });

    // 使用 useMemo 进行缓存，避免每次渲染都重建 errorMessages 数组
    const errorMessages = useMemo(() => [
        t("服务器打了个盹，正在努力醒来中..."),
        t("emmm...服务器也在摸鱼了，一会儿再来试试？"),
        t("服务器可能又去卷了，等它卷完再回来。"),
        t("服务器也想躺平了，老板叫都叫不动它。"),
        t("服务器请假了，回来后它会给你打个电话。"),
        t("服务器跑路了，我们正在派人抓它回来。"),
        t("服务器去找对象了，等它回来再说吧。")
    ], [t]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * errorMessages.length);
        setRandomErrorMessage(errorMessages[randomIndex]); // 随机选择一个错误消息

        const userAgent = navigator.userAgent;
        const url = window.location.href;
        const timestamp = new Date().toISOString();
        const referrer = document.referrer || t('无');

        setErrorDetails({
            userAgent,
            url,
            timestamp,
            referrer
        });
    }, [t, errorMessages]); // 将 errorMessages 作为依赖项

    const feedbackUrl = `/error_fb?userAgent=${encodeURIComponent(errorDetails.userAgent)}&url=${encodeURIComponent(errorDetails.url)}&timestamp=${encodeURIComponent(errorDetails.timestamp)}&referrer=${encodeURIComponent(errorDetails.referrer)}`;

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-4">
                <div className="rounded-lg p-8 text-center">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-red-500"/>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{t("服务器出错了")}</h2>
                    <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
                        {randomErrorMessage}
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button
                            variant="default"
                            onClick={() => router.back()}
                            className="bg-red-500 hover:bg-red-600 text-white">
                            {t("返回上一页")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/?new=true')}
                            className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                        >
                            {t("返回首页")}
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => window.open(feedbackUrl, '_blank')}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {t("反馈问题")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
