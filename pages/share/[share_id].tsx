import React from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import Meta from '@/components/ui/Meta';
import ChatList from '@/app/[消息显示]/chat_list';
import dynamic from 'next/dynamic';

const CText = dynamic(() => import('@/app/copyright/ctext'), {
    ssr: false
});

export default function SharePage() {
    const router = useRouter();
    const { share_id } = router.query;
    const { isLoaded } = useUser();

    return (
        <>
            <Meta
                pageName="分享的对话"
                pageDescription="查看分享的对话内容"
            />
            <div className="flex flex-col min-h-screen bg-white dark:bg-[#212121]">
                {/* 头部 */}
                <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-2.5 
                                 bg-white dark:bg-[#212121] z-30 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                                     transition-colors duration-200 text-gray-700 dark:text-gray-300"
                            title="返回首页"
                            aria-label="返回首页"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            分享的对话
                        </h1>
                    </div>
                </header>

                {/* 主要内容 */}
                <div className="flex-1 overflow-auto w-full pt-12">
                    <div className="m-auto text-base py-[18px] px-3 md:px-4 lg:px-4 xl:px-5">
                        <div className="mx-auto flex flex-col items-center justify-center gap-8 max-w-2xl">
                            {/* 施工图标 */}
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <div className="absolute inset-0 mt-20
                                              rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         className="h-16 w-16 text-gray-400 dark:text-gray-500" 
                                         fill="none" 
                                         viewBox="0 0 24 24" 
                                         stroke="currentColor">
                                        <path strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              strokeWidth={1.5} 
                                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              strokeWidth={1.5} 
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* 文字信息 */}
                            <div className="space-y-3 text-center">
                                <h2 className="text-2xl font-medium bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 
                                             bg-clip-text text-transparent">
                                    施工中...
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                                    我们正在施工中，请稍后再来查看
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 底部版权信息 */}
                <div className="flex justify-center py-4 bg-transparent">
                    <CText />
                </div>
            </div>
        </>
    );
} 