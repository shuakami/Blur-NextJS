"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useToast } from '../../../hooks/ui/use-toast';
import useTranslation from '../../../hooks/i18n/useTranslation';
import { useRouter } from "next/navigation";

const LoginHandler = ({
    email,
    onSuccess,
    onEmailSent
}: {
    email: string;
    onSuccess: () => void;
    onEmailSent: () => void;
}) => {
    const { signIn, setActive } = useSignIn();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleEmailCheck = async (): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            if (!signIn) {
                throw new Error(t("登录初始化失败"));
            }

            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error(t("邮箱格式不正确"));
            }

            // 创建邮箱验证
            await signIn.create({
                identifier: email,
            });

            onEmailSent();
            return true;
        } catch (err: any) {
            console.error("[LoginHandler] Error:", err);
            setError(err.errors?.[0]?.message || t("登录失败"));
            toast({
                variant: "destructive",
                title: t("登录错误"),
                description: t(err.errors?.[0]?.message || "登录失败"),
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            if (!signIn) {
                throw new Error(t("登录初始化失败"));
            }

            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                onSuccess();
                return true;
            } else {
                throw new Error(t("登录失败"));
            }
        } catch (err: any) {
            console.error("[LoginHandler] Error:", err);
            setError(err.errors?.[0]?.message || t("登录失败"));
            toast({
                variant: "destructive",
                title: t("登录错误"),
                description: t(err.errors?.[0]?.message || "登录失败"),
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleBulLogin = async (email: string, password: string): Promise<boolean> => {
        try {
            // 实现内测登录逻辑
            // 返回登录是否成功
            return true;
        } catch (error) {
            return false;
        }
    };

    return {
        handleEmailCheck,
        handlePasswordLogin,
        handleBulLogin,
        loading,
        error
    };
};

export default LoginHandler;