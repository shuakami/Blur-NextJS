// components/login/EmailLoginForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTranslation from "@/hooks/useTranslation";

interface EmailLoginFormProps {
    onSubmit: (email: string, password: string) => void;
}

export default function EmailLoginForm({ onSubmit }: EmailLoginFormProps) {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 可以在这里添加邮箱验证逻辑
        setShowPassword(true);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSubmit(email, password);
        } catch (err: any) {
            setError(err.message || "登录失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
                {!showPassword && (
                    <form
                        key="email"
                        onSubmit={handleEmailSubmit}
                        className="w-full"
                    >
                        <div className="mb-4">
                            <label htmlFor="email"
                                   className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                                {t("邮件地址")}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("输入你的邮件地址…")}
                                className="w-full h-10 shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <p className="text-[#acaba9] dark:text-[#8c8c8c] text-xs mt-2">
                                {t("请输入您的邮箱地址")} &nbsp;
                                <a href="/forgot-account" className="text-blue-500/80">{t("忘记了登录邮箱？")}</a>
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mb-4 bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90 h-10"
                            disabled={loading}
                        >
                            {loading ? t("下一步...") : t("下一步")}
                        </Button>

                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </form>
                )}

                {showPassword && (
                    <form
                        key="password"
                        className="w-full"
                    >
                        <div className="mb-4">
                            <label htmlFor="password"
                                   className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                                {t("密码")}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t("输入你的密码…")}
                                className="w-full h-10 shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mb-4 bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90 h-10"
                            disabled={loading}
                        >
                            {loading ? t("登录中…") : t("登录")}
                        </Button>

                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </form>
                )}
        </div>
    );
}
