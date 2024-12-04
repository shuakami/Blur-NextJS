"use client";

import DocumentPage from '@/components/document-page';
import { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '隐私政策',
    description: '了解我们如何收集、使用和保护您的个人信息',
};

export default function PrivacyPage() {
    return (
        <DocumentPage 
            title="隐私政策" 
            description="了解我们如何收集、使用和保护您的个人信息"
        >
            <div className="space-y-12 text-sm text-neutral-800 dark:text-neutral-200">
                <section className="space-y-4">
                    <p className="leading-relaxed">
                        我们深知个人信息对您的重要性，也感谢您对我们的信任。这份隐私政策将帮助您了解我们如何处理您的信息。作为一个正在成长的产品，我们始终将用户的隐私保护放在首位。
                    </p>

                    <div className="relative pl-4 py-4 bg-blue-100 dark:bg-blue-800/20 rounded-lg">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 rounded-full" />
                        <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                            请注意，我们仍处于内测阶段，可能会根据产品发展调整数据处理方式。每当有重要变更，我们都会及时通知您。您随时可以联系我们，了解最新的隐私保护措施。
                        </p>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">信息收集</h2>
                    <div className="space-y-3">
                        <p className="leading-relaxed">
                            我们收集的信息主要包括：
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
                        <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            基本账户信息，如您的邮箱地址，这是必需的
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            使用数据，如访问日志、性能数据，用于改进服务
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            设备信息，如浏览器类型、操作系统，用于优化体验
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            您主动提供的反馈信息，帮助我们改进产品
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">信息使用</h2>
                    <div className="space-y-3">
                        <p className="leading-relaxed">
                            我们收集的信息仅用于：提供和改进服务、了解使用趋势、检测和解决问题。我们不会将您的信息用于其他目的，也不会与第三方共享您的个人信息。
                        </p>
                        <p className="leading-relaxed">
                            在内测阶段，我们可能会分析使用数据来优化产品体验。这些数据都是匿名的，不会包含您的个人身份信息。
                        </p>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">信息保护</h2>
                    <div className="space-y-3">
                        <p className="leading-relaxed">
                            我们采取多重措施保护您的信息安全：使用加密技术保护数据传输、定期进行安全评估、严格控制内部访问权限。但请注意，在互联网环境下，没有任何系统是完全安全的。
                        </p>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">您的权利</h2>
                    <div className="space-y-3">
                        <p className="leading-relaxed">
                            关于您的个人信息，您有权：访问、更正、删除您的信息，或要求我们限制对您信息的使用。如果您想行使这些权利，请随时联系我们。
                        </p>
                    </div>
                </section>

                <section className="relative pl-4 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                    <div className="space-y-3">
                        <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">联系我们</h2>
                        <p className="leading-relaxed">
                            如果您对我们的隐私政策有任何疑问，或者想了解我们如何处理您的信息，请随时联系我们：
                        </p>
                        <div className="flex items-center space-x-3 text-[13px]">
                            <a href="mailto:shukami@sdjz.wiki" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                发送邮件
                                <Mail className="w-3.5 h-3.5 ml-0.5" />
                            </a>
                            <span className="text-neutral-400 dark:text-neutral-600">·</span>
                            <Link 
                                href={{ pathname: "/feedback" }} 
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                提交反馈
                                <MessageCircle className="w-3.5 h-3.5 ml-0.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </DocumentPage>
    );
}