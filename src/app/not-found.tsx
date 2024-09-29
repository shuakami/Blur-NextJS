"use client";

import React, {useEffect, useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {MessageCircleWarning} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";

export default function Custom404() {
    const {t} = useTranslation(); // 使用 useTranslation 钩子
    const router = useRouter();
    const [randomMessage, setRandomMessage] = useState<string>('');

    // 使用 useMemo 进行缓存，避免每次渲染都重建 messages 数组
    const messages = useMemo(() => [
        t("从前有一只小鸭子在排队，它想和前面的小鸭子对齐，可是怎么也对不齐。于是它就嘀咕着说“对不齐呀，对不齐呀”。"),
        t("404不哭，站起来撸代码！"),
        t("你要找的页面可能去火星了，要不要一起去看看？"),
        t("这个页面比周杰伦的新歌还难找..."),
        t("该页面可能被打工人带走加班了。"),
        t("页面不在家，去楼下买烤冷面了，很快回来。"),
        t("这个链接可能是个酱油党，只是路过一下。"),
        t("页面去追剧了，等它追完《神奇宝贝》就回来。"),
        t("这个页面还没出生，要不你给它起个名字？")
    ], [t]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        setRandomMessage(messages[randomIndex]); // 随机选择一个消息
    }, [messages]); // 将 messages 作为依赖项

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-4">
                <div className="rounded-lg p-8 text-center">
                    <MessageCircleWarning className="h-16 w-16 mx-auto mb-6 text-blue-500"/>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{t("页面走丢了")}</h2>
                    <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">{randomMessage}</p>
                    <div className="flex justify-center space-x-4">
                        <Button
                            variant="default"
                            onClick={() => router.push('/')}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {t("返回首页")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                        >
                            {t("返回上一页")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
