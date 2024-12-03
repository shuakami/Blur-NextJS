"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Meta from './ui/Meta';

interface DocumentPageProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    backLink?: string;
    showFooter?: boolean;
}

export default function DocumentPage({
    title,
    description,
    children,
    backLink="/",
    showFooter = true
}: DocumentPageProps) {
    return (
        <>
        <Meta pageName={title} pageDescription={description} />
        <div className="min-h-screen bg-white dark:bg-neutral-900">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {/* 返回按钮 */}
                    <Link
                        href={backLink as any}
                        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        返回
                    </Link>

                    {/* 标题区域 */}
                    <div className="space-y-2 pb-8 border-b dark:border-neutral-800">
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-neutral-500 dark:text-neutral-400">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* 文档内容 */}
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {children}
                    </div>

                    {/* 页脚 */}
                    {showFooter && (
                        <div className="pt-8 mt-16 border-t dark:border-neutral-800">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                最后更新于 2024-12-02
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div></>
    );
} 