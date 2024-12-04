"use client";

import DocumentPage from '@/components/document-page';
import { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '用户协议',
    description: '了解使用我们服务的条款和条件',
};

export default function TermsPage() {
    return (
        <DocumentPage 
            title="用户协议" 
            description="了解使用我们服务的条款和条件"
        >
            <div className="space-y-12 text-sm text-neutral-800 dark:text-neutral-200">
                <section className="space-y-4">
                    <p className="leading-relaxed">
                        首先，感谢您选择使用我们的服务。这份协议可能看起来很长，但我们会尽量用简单的语言说明白。作为一个处于早期内测阶段的产品，我们希望能和您建立起真诚的信任关系。
                    </p>

                    <div className="relative pl-4 py-4 bg-blue-100 dark:bg-blue-800/20 rounded-lg">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 rounded-full" />
                        <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                            我们正处于产品开发的最初阶段。这意味着您可能会遇到一些不完善的地方，比如功能可能不够稳定，界面可能经常变动，甚至数据可能会丢失。但正是因为现在还很不完善，您的参与和反馈对我们来说格外重要。
                        </p>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">关于您的账户</h2>
                    <div className="space-y-3">
                        <p className="leading-relaxed">
                            我们需要您提供一个邮箱地址来创建账户。这不仅是为了让您能使用我们的服务，更是为了在产品有重要更新或变动时，能第一时间通知到您。我们承诺不会滥用您的信息，也不会给您发送垃圾邮件。
                        </p>
                        <p className="leading-relaxed">
                            作为内测用户，您的账户会获得一些特殊权限。您可以优先体验新功能，直接和开发团队交流，您的反馈也会得到优先处理。当然，这也意味着我们希望您能：
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
                        <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            及时告诉我们使用中遇到的问题，这对提升产品质量非常重要
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            理解并接受产品可能存在的不稳定，我们会努力做得更好
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">数据和隐私</h2>
                    <div className="space-y-3">
                        <p className="leading-relaxed">
                            关于数据安全，我们必须坦白：在内测阶段，我们无法保证数据的永久保存。系统可能会因为升级、调试或其他技术原因而重置。我们建议您不要在系统中存储重要信息，如果有任何担心，请随时备份数据。
                        </p>
                        <p className="leading-relaxed">
                            但是，我们会尽最大努力保护您的隐私。您的个人信息只会用于必要的功能实现，不会用于其他目的。如果未来需要调整数据使用方式，我们一定会提前告知您。
                        </p>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">未来的改变</h2>
                    <p className="leading-relaxed">
                        作为一个成长中的产品，变化是不可避免的。我们可能会调整功能、更新界面、甚至改变产品的方向。每当有重要变动，我们都会提前通知您，认真听取您的意见。您的反馈将帮助我们做出更好的决定。
                    </p>
                </section>

                <section className="relative pl-4 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                    <div className="space-y-3">
                        <h2 className="text-base font-medium text-neutral-800 dark:text-neutral-200">联系我们</h2>
                        <p className="leading-relaxed">
                            如果您有任何问题、建议或担忧，请随时联系我们。作为内测用户，您可以通过以下方式直接和开发团队对话：
                        </p>
                        <div className="flex items-center space-x-3 text-[13px]">
                            <a href="mailto:shukami@sdjz.wiki" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                发送邮件
                                <Mail className="w-3.5 h-3.5 ml-0.5" />
                            </a>
                            <span className="text-neutral-400 dark:text-neutral-600">·</span>
                            <Link href={{ pathname: "/feedback" }} className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
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