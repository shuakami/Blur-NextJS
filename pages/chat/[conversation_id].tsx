"use client";
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import ChatList from '@/app/[消息显示]/chat_list';
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import ChatSidebar from "@/components/chat/chat_sidebar";
import {ChatProvider} from '@/app/[上下文]/ChatContext';
import {fetchHistory} from '@/app/[拉取历史]/fetch_history';
import {useSearchParams} from "next/navigation";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // @ts-ignore
    const conversation_id = searchParams.get('conversation_id'); // 获取 URL 中的 conversation_id
    const [exists, setExists] = useState<boolean | null>(null);
    const user_id = 'anonymous_user';

    useEffect(() => {
        if (!conversation_id) return;

        const checkConversation = async () => {
            try {
                const history = await fetchHistory({user_id, conversation_id});
                if (history.messages.length > 0) {
                    setExists(true);
                } else {
                    setExists(false);
                }
            } catch (error) {
                console.error('检查对话失败:', error);
                setExists(false);
            }
        };

        checkConversation();
    }, [conversation_id]);

    useEffect(() => {
        if (exists === false) {
            // 对话不存在，重定向到首页
            router.replace('/');
        }
    }, [exists, router]);

    if (exists === null) {
        return <div>加载中...</div>;
    }

    if (!conversation_id) {
        return <div>没有提供 conversation_id。</div>;
    }

    return (
        <ChatProvider>
            <div className="w-full h-screen flex flex-row">
                {/* 左侧的侧边栏 */}
                <div className="w-1/4 min-w-[200px] md:w-1/5 lg:w-1/4 h-full">
                    <ChatSidebar
                        items={[]} // 传递空数组或适当的 folderItems
                        user={{
                            avatarUrl: 'https://github.com/shuakami.png',
                            name: 'Admin',
                            status: 'Test#AL1_0001',
                        }}
                        onSelectConversation={(id: string) => router.push(`/chat/${id}`)}
                    />
                </div>

                {/* 右侧的聊天列表和输入框 */}
                <div className="h-full flex flex-col flex-1">
                    <div className="flex-1 overflow-auto p-4">
                        <ChatList user_id={user_id} conversation_id={conversation_id}/>
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