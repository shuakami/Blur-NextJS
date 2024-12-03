"use client";

import React from 'react';
import DocumentPage from '@/components/document-page';
import { TicketIcon, MessagesSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TicketList from '../components/TicketList';


export default function FeedbackPage() {
    return (
        <DocumentPage
            title="帮助中心"
            description="选择合适的方式获取帮助"
        >
            <div className="space-y-12 text-sm text-neutral-800 dark:text-neutral-200">
                {/* 介绍部分 */}
                <section className="space-y-4">
                    <p className="leading-relaxed">
                        我们致力于为您提供最好的帮助服务。无论您遇到任何问题，我们都将竭诚为您解答。请选择以下方式之一与我们取得联系。
                    </p>
                </section>

                {/* 支持选项 */}
                <section className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* 工单选项 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="group"
                        >
                            <Link href="/feedback/ticket" className="block p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/75 dark:border-neutral-700/75 [box-shadow:0_0_1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.05)] hover:[box-shadow:0_0_1px_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.07)] dark:hover:[box-shadow:0_0_1px_rgba(0,0,0,0.12),0_3px_6px_rgba(0,0,0,0.16),0_12px_32px_rgba(0,0,0,0.12)] transition-shadow">
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                        <TicketIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">提交工单</h3>
                                        <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                            适用于需要详细调查的问题，我们会在24小时内回复
                                        </p>
                                    </div>
                                    <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <span className="inline-flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            创建工单
                                            <svg className="w-4 h-4 ml-1" viewBox="0 0 16 16" fill="none">
                                                <path d="M6.5 3.5L11 8L6.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        {/* 聊天选项 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="group"
                        >
                            <a href="#" className="block p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/75 dark:border-neutral-700/75 [box-shadow:0_0_1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.05)] hover:[box-shadow:0_0_1px_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.07)] dark:hover:[box-shadow:0_0_1px_rgba(0,0,0,0.12),0_3px_6px_rgba(0,0,0,0.16),0_12px_32px_rgba(0,0,0,0.12)] transition-shadow">
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                        <MessagesSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">在线聊天</h3>
                                        <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                            适用于简单问题，我们的支持团队会立即为您解答
                                        </p>
                                    </div>
                                    <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <span className="inline-flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            开始聊天
                                            <svg className="w-4 h-4 ml-1" viewBox="0 0 16 16" fill="none">
                                                <path d="M6.5 3.5L11 8L6.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </motion.div>
                    </div>
                </section> 

                {/* 已提交工单列表 */}
                <TicketList />
            </div>
        </DocumentPage>
    );
}