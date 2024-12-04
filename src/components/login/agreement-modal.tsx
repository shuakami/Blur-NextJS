"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import useTranslation from '../../hooks/i18n/useTranslation';
import Link from "next/link";
import { motion } from "framer-motion";

interface AgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
    loading: boolean;
}

export default function AgreementModal({
    isOpen,
    onClose,
    onAgree,
    loading
}: AgreementModalProps) {
    const { t } = useTranslation();
    const [agreed, setAgreed] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [hasCountdownFinished, setHasCountdownFinished] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        setHasCountdownFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setCountdown(10);
            setHasCountdownFinished(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-full h-4/5 md:h-screen p-0 gap-0 dark:bg-neutral-900 bg-white">
                <div className="h-full flex flex-col">
                    <motion.div 
                        className="px-8 py-4 border-b dark:border-neutral-800"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                                {t("用户协议与隐私政策")}
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t("请仔细阅读以下条款，这些条款将对您使用我们的服务产生重要影响")}
                            </p>
                        </div>
                    </motion.div>

                    <ScrollArea className="flex-1 px-8">
                        <motion.div 
                            className="max-w-4xl mx-auto py-8 space-y-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <section className="space-y-3">
                                <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                                    {t("用户协议")}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {t("通过使用我们的服务，您同意遵守我们的用户协议。该协议详细说明了您的权利和义务，以及我们的服务条款。")}
                                </p>
                                <Link 
                                    href={"/terms" as any}
                                    target="_blank"
                                    className="inline-flex items-center text-sm text-[#2383e2] hover:text-[#2383e2]/90 dark:text-[#1a73e8] dark:hover:text-[#1a73e8]/90 transition-colors"
                                >
                                    {t("查看完整用户协议")}
                                    <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </Link>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                                    {t("隐私政策")}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {t("我们重视您的隐私。我们的隐私政策说明了我们如何收集、使用和保护您的个人信息。")}
                                </p>
                                <Link 
                                    href={"/privacy" as any}
                                    target="_blank"
                                    className="inline-flex items-center text-sm text-[#2383e2] hover:text-[#2383e2]/90 dark:text-[#1a73e8] dark:hover:text-[#1a73e8]/90 transition-colors"
                                >
                                    {t("查看完整隐私政策")}
                                    <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </Link>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                                    {t("内测协议")}
                                </h3>
                                <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    <p>
                                        {t("首先要坦白的是，这确实是一个非常早期的版本。目前我们刚刚完成了基础框架的搭建，很多核心功能还在开发中，界面也在不断优化。作为内测用户，您可能会遇到各种各样的问题 —— 功能可能会突然无法使用，界面可能会频繁变动，服务可能会不定时中断，甚至您的数据在后续更新中可能无法保留。")}
                                    </p>
                                    
                                    <p>
                                        {t("说实话，这听起来确实不太令人期待。但正因为现在还什么都不完善，您的参与对我们来说格外重要。您的每一个使用体验、每一条反馈意见，都将直接影响产品的发展方向。我们希望能够和您一起，从零开始打造一个真正好用的产品。")}
                                    </p>

                                    <p>
                                        {t("作为最早期的用户，您提出的任何问题或建议都会得到我们的优先关注和处理。我们会定期收集您的反馈，认真记录每一个问题，并持续不断地改进产品。虽然现在可能会遇到这样那样的问题，但我们承诺会倾听每一位用户的声音，尽最大努力为您带来更好的体验。")}
                                    </p>

                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                                        <p className="text-sm text-blue-800 dark:text-blue-100">
                                            {t("感谢您愿意在这个产品最初期就选择相信我们。这份信任对我们来说弥足珍贵。")}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    </ScrollArea>

                    <motion.div 
                        className="px-8 py-4 border-t dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <label 
                                className="flex items-center space-x-3 cursor-pointer group"
                                htmlFor="agreement"
                            >
                                <Checkbox 
                                    id="agreement" 
                                    checked={agreed}
                                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                                    className="data-[state=checked]:bg-[#2383e2] data-[state=checked]:border-[#2383e2]
                                             dark:data-[state=checked]:bg-[#1a73e8] dark:data-[state=checked]:border-[#1a73e8]"
                                />
                                <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                                    {t("我已阅读并同意上述所有协议")}
                                </span>
                            </label>

                            <div className="flex items-center space-x-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="hidden md:block text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                >
                                    {t("取消")}
                                </Button>
                                <Button
                                    type="button"
                                    className="w-full bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90"
                                    onClick={onAgree}
                                    disabled={!agreed || loading}
                                >
                                    {loading ? t("注册中...") : t("同意并继续")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}