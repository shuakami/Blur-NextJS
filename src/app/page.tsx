"use client";

import React, {useState} from 'react';
import Header from "@/components/ui/header";
import ChatList from '@/app/[消息显示]/chat_list';
import ErrorModal from "@/components/ui/error-modal";
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import LanguageDropdown from "@/app/[语言选择器]/language-dropdown";
import ChatSidebar from "@/components/chat/chat_sidebar";
import {FolderOpen} from "lucide-react";
import {ChatProvider} from '@/app/[上下文]/ChatContext';
import {useRouter} from 'next/navigation';

export default function Home() {
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
    const router = useRouter();

    const user = {
        avatarUrl: 'https://github.com/shuakami.png',
        name: 'Admin',
        status: 'Test#AL1_0001',
    };

    const handleSelectConversation = (conversation_id: string) => {
        setCurrentConversationId(conversation_id);
        // 使用路由导航到对应的对话页面
        router.push(`/chat/${conversation_id}`);
    };

    return (
        <ChatProvider>
            <div className="w-full h-screen flex flex-row">
                {/* 左侧的侧边栏 */}
                <div className="w-1/4 min-w-[200px] md:w-1/5 lg:w-1/4 h-full">
                    <ChatSidebar
                        items={[]} // 传递空数组或适当的 folderItems
                        user={user}
                        onSelectConversation={handleSelectConversation}
                    />
                </div>

                {/* 右侧的聊天列表和输入框 */}
                <div className="h-full flex flex-col flex-1">
                    {currentConversationId ? (
                        <>
                            <div className="flex-1 overflow-auto p-4">
                                <ChatList user_id="anonymous_user" conversation_id={currentConversationId}/>
                            </div>
                            <div className="w-full flex justify-center p-4">
                                <div className="w-full max-w-2xl">
                                    <ChatInputWrapper/>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">请在左侧选择一个对话或在下方输入开启一个新对话</p>
                        </div>
                    )}
                </div>
            </div>
        </ChatProvider>
    );
}
