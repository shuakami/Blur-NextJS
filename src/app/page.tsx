// src/app/pages/Home.tsx
"use client";

import React from 'react';
import ChatList from '@/app/[消息显示]/chat_list';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import {ChatProvider} from '@/app/[上下文]/ChatContext';
import {useRouter} from 'next/navigation';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';

export default function Home() {
    const router = useRouter();

    const user_id = 'anonymous_user';

    return (
        <ChatProvider>
            <div className="w-full h-screen flex flex-row">
                {/* 左侧的侧边栏 */}
                <div className="w-1/4 min-w-[200px] md:w-1/5 lg:w-1/4 h-full">
                    <MessagesSidebar user_id={user_id}/>
                </div>

                {/* 右侧的聊天列表和输入框 */}
                <div className="h-full flex flex-col flex-1">
                    <div className="flex-1 overflow-auto p-4">
                        <ChatList user_id={user_id}/>
                    </div>
                    <div className="w-full flex justify-center p-4">
                        <div className="w-full max-w-2xl">
                            <ChatInputWrapper/>
                        </div>
                    </div>
                </div>
            </div>
        </ChatProvider>
    );
}
