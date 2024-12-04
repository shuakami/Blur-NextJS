"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTranslation from '../../hooks/i18n/useTranslation';
import { useRouter } from "next/navigation";
import LoginHandler from "./[安全工具]/LoginHandler";
import { Eye, EyeOff } from "lucide-react";
import { Route } from "next";

export default function Login({ callback }: { callback: () => void }) {
    const router = useRouter();
    const { t } = useTranslation();
    const [isEmailLogin, setIsEmailLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [stage, setStage] = useState<"email" | "password">("email");

    // 内测登录状态
    const [bulEmail, setBulEmail] = useState("");
    const [bulPassword, setBulPassword] = useState("");
    const [showBulPassword, setShowBulPassword] = useState(false);

    const loginHandler = LoginHandler({
        email: isEmailLogin ? email : bulEmail,
        onSuccess: () => {
            router.push("/" as Route);
        },
        onEmailSent: () => {
            setStage("password");
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEmailLogin) {
            if (stage === "email") {
                const success = await loginHandler.handleEmailCheck();
                if (success) {
                    setStage("password");
                }
            } else {
                const success = await loginHandler.handlePasswordLogin(password);
                if (success) {
                    window.location.href = "/?new=true";
                }
            }
        } else {
            // 内测登录处理
            const success = await loginHandler.handlePasswordLogin(bulPassword);
            if (success) {
                window.location.href = "/?new=true";
            }
        }
    };

    return (
        <div className="w-full">
            <div className="w-full">
                {/* GitHub登录按钮 */}
                <Button
                    variant="outline" 
                    className="w-full mb-3 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333]/45 dark:border-[#666666]/50"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                        <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z" />
                    </svg>
                    Github {t("登录")}
                </Button>

                {/* Google登录按钮 */}
                <Button
                    variant="outline"
                    className="w-full mb-3 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333]/45 dark:border-[#666666]/50"
                >
                    <svg viewBox="0 0 18 18" className="w-4 h-4 mr-2">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    Google {t("登录")}
                </Button>

                {/* 内测用户登录按钮 */}
                <Button
                    variant="outline"
                    className="w-full mb-8 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333]/45 dark:border-[#666666]/50"
                    onClick={() => setIsEmailLogin(!isEmailLogin)}
                >
                    <svg role="graphics-symbol" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                        <path d="M14.757 4A5.724 5.724 0 009 9.748c0 2.364 1.389 4.456 3.586 5.335V23.6c0 .255.079.483.272.676l1.53 1.477a.578.578 0 00.808-.009l2.769-2.768a.598.598 0 000-.87l-1.591-1.574 2.232-2.232a.602.602 0 00-.017-.861l-2.171-2.18c2.628-1.116 4.087-3.13 4.087-5.511A5.733 5.733 0 0014.757 4zm0 5.344a1.55 1.55 0 01-1.547-1.547c0-.861.685-1.547 1.547-1.547a1.55 1.55 0 011.547 1.547 1.55 1.55 0 01-1.547 1.547z" />
                    </svg>
                    {t("内测用户登录")} (BUL)
                </Button>

                <hr className="border-t border-[#acaba9]/15 dark:border-[#666666]/40 mb-5" />

                {/* 邮箱登录表单 */}
                <div className={`transition-opacity duration-200 ${isEmailLogin ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className="w-full">
                        <form className="w-full" onSubmit={handleSubmit}>
                            {stage === "email" ? (
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                                        {t("邮件地址")}
                                    </label>
                                    <Input
                                        type="email"
                                        id="email"
                                        placeholder={t("输入你的邮件地址...")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full h-10 shadow-sm"
                                    />
                                    <p className="text-[#acaba9] dark:text-[#8c8c8c] text-xs mt-2">
                                        {t("请输入您的邮箱地址")} &nbsp;
                                        <a href="/forgot-account" className="text-blue-500/80">
                                            {t("忘记了登录邮箱？")}
                                        </a>
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                                        {t("密码")}
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            placeholder={t("输入密码...")}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full h-10 shadow-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                {stage === "email" ? t("继续") : t("登录")}
                            </Button>
                        </form>
                        {/* 添加注册按钮 */}
                        <div className="mt-6 text-center">
                            <Button
                                variant="ghost"
                                className="text-sm text-[#2383e2] dark:text-[#1a73e8] hover:bg-transparent hover:text-[#2383e2]/90 dark:hover:text-[#1a73e8]/90"
                                onClick={callback}
                            >
                                {t("没有账号？立即注册")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 内测用户登录表单 */}
                <div className={`transition-opacity duration-200 ${!isEmailLogin ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className="w-full">
                        <form className="w-full" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="bulEmail" className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                                    {t("内测邮箱")}
                                </label>
                                <Input
                                    type="email"
                                    id="bulEmail"
                                    placeholder={t("输入内测邮箱...")}
                                    value={bulEmail}
                                    onChange={(e) => setBulEmail(e.target.value)}
                                    required
                                    className="w-full h-10 shadow-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="bulPassword" className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2">
                                    {t("内测密码")}
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showBulPassword ? "text" : "password"}
                                        id="bulPassword"
                                        placeholder={t("输入内测密码...")}
                                        value={bulPassword}
                                        onChange={(e) => setBulPassword(e.target.value)}
                                        required
                                        className="w-full h-10 shadow-sm pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowBulPassword(!showBulPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    >
                                        {showBulPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                {t("内测登录")}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}