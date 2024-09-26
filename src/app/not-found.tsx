"use client";

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {MessageCircleWarning} from "lucide-react";

const messages = [
    "从前有一只小鸭子在排队，它想和前面的小鸭子对齐，可是怎么也对不齐。于是它就嘀咕着说“对不齐呀，对不齐呀”。",
    "404不哭，站起来撸代码！",
    "你要找的页面可能去火星了，要不要一起去看看？",
    "这个页面比周杰伦的新歌还难找...",
    "这个页面和我的对象一样，都是不存在的。",
    "该页面可能被打工人带走加班了。",
    "页面不在家，去楼下买烤冷面了，很快回来。",
    "这个链接可能是个酱油党，只是路过一下。",
    "页面去追剧了，等它追完《神奇宝贝》就回来。",
    "这个页面还没出生，要不你给它起个名字？"
];

export default function Custom404() {
    const router = useRouter();
    const [randomMessage, setRandomMessage] = useState<string>('');

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        setRandomMessage(messages[randomIndex]);
    }, []);

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-4">
                <div className="rounded-lg p-8 text-center">
                    <MessageCircleWarning className="h-16 w-16 mx-auto mb-6 text-blue-500"/>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">页面走丢了</h2>
                    <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">{randomMessage}</p>
                    <div className="flex justify-center space-x-4">
                        <Button
                            variant="default"
                            onClick={() => router.push('/')}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            返回首页
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                        >
                            返回上一页
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}