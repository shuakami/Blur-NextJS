// components/login/BetaLoginForm.tsx

"use client";

import React, {useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTranslation from "@/hooks/useTranslation";
import { useRouter } from "next/router";
import LoginHandler from "@/components/login/[安全工具]/LoginHandler";
import Link from "next/link";


export default function BetaLoginForm() {
    const { t } = useTranslation();
    const [stage, setStage] = useState<"email" | "password">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const {handleLogin, loading} = LoginHandler({
        email,
        password,
        onSuccess: () => {
            router.push("/?new=true").catch((err) => {
                console.error("路由跳转失败：", err);
            }); // 处理 router.push 的 Promise
        },
    });

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStage("password");
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin();
    };

    return (
        <div className="w-full">
            {stage === "email" && (
                <form key="beta-email" onSubmit={handleEmailSubmit} className="w-full">
                    <div className="mb-4">
                        <label
                            htmlFor="beta-email"
                            className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2"
                        >
                            {t("内测用户邮件地址")}
                        </label>
                        <Input
                            id="beta-email"
                            type="email"
                            placeholder={t("输入你的内测用户邮件地址…")}
                            className="w-full h-10 shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <p className="text-[#acaba9] dark:text-[#8c8c8c] text-xs mt-2">
                            {t("拥有内测资格和账号的用户可抢先体验最新功能。")} &nbsp;
                            <Link href="/forgot-account" className="text-blue-500/80">
                                {t("忘记了你的账号？")}
                            </Link>
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mb-4 bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90 h-10"
                        disabled={loading}
                    >
                        {loading ? t("下一步...") : t("下一步")}
                    </Button>
                </form>
            )}

            {stage === "password" && (
                <form key="beta-password" onSubmit={handlePasswordSubmit} className="w-full">
                    <div className="mb-4">
                        <label
                            htmlFor="beta-password"
                            className="block text-[#787874] dark:text-[#a1a1a1] text-sm font-medium mb-2"
                        >
                            {t("密码")}
                        </label>
                        <Input
                            id="beta-password"
                            type="password"
                            placeholder={t("输入你的密码…")}
                            className="w-full h-10 shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p className="text-[#acaba9] dark:text-[#8c8c8c] text-xs mt-2">
                            {t("继续输入密码以登录。")} &nbsp;
                            <Link href="/forgot-password" className="text-blue-500/80">
                                {t("忘记了你的密码？")}
                            </Link>
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mb-4 bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90 h-10"
                        disabled={loading}
                    >
                        {loading ? t("登录中…") : t("登录")}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm text-[#acaba9] dark:text-[#b3b3b3]"
                        onClick={() => setStage("email")}
                    >
                        {t("返回")}
                    </Button>
                </form>
            )}
        </div>
    );
}
