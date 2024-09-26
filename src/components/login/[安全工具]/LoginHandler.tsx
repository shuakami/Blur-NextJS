"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import useTranslation from "@/hooks/useTranslation";

interface LoginHandlerProps {
    email: string;
    password: string;
    onSuccess: () => void;
}

const LoginHandler: ({email, password, onSuccess}: { email: any; password: any; onSuccess: any }) => {
    handleLogin: () => Promise<void>;
    loading: boolean;
    error: string | null
} = ({ email, password, onSuccess }) => {
    const { signIn, setActive } = useSignIn();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            // @ts-ignore
            const result = await signIn.create({
                identifier: email,
                password: password,
            });

            if (result.status === "complete") {
                if (setActive) {
                    await setActive({ session: result.createdSessionId });
                }
                onSuccess();
            } else {
                setError(t("登录失败，请重试"));
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || t("登录失败，请重试"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: t("LoginError"),
                description: t(error),
            });
        }
    }, [error, toast, t]);

    return { handleLogin, loading, error };
};

export default LoginHandler;
