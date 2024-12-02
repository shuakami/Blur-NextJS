import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useTranslation from "@/hooks/useTranslation";

interface SignupHandlerProps {
    email: string;
    username: string;
    password: string;
    inviteCode: string;
    onSuccess: () => void;
}

const SignupHandler = ({
    email,
    username,
    password,
    inviteCode,
    onSuccess
}: SignupHandlerProps) => {
    const { signUp } = useSignUp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleEmailCheck = async (): Promise<boolean> => {
        console.log("[handleEmailCheck] Starting email check process");
        setLoading(true);
        setError(null);

        try {
            // 验证邮箱格式
            console.log("[handleEmailCheck] Validating email format:", email);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("邮箱格式不正确");
            }

            // 验证邀请码
            console.log("[handleEmailCheck] Validating invite code:", inviteCode);
            const validCodes = process.env.NEXT_PUBLIC_INVITE_CODES?.split(",") || [];
            if (!validCodes.includes(inviteCode)) {
                toast({
                    title: t("邀请码无效"),
                    description: t("不存在或已被使用")
                });
                throw new Error("邀请码无效");
            }

            if (!signUp) {
                throw new Error("注册初始化失败");
            }

            // 创建注册尝试
            console.log("[handleEmailCheck] Creating signup attempt");
            try {
                const createResponse = await signUp.create({ emailAddress: email });
                if (!createResponse) {
                    throw new Error("无法创建注册尝试");
                }
            } catch (err: any) {
                // 处理邮箱已被注册的错误
                if (err.message?.includes("That email address is taken")) {
                    toast({
                        title: t("该邮箱已被注册"),
                        description: t("请更换邮箱")
                    });
                    throw new Error("该邮箱已被注册");
                }
                throw err;
            }

            // 准备邮件验证
            console.log("[handleEmailCheck] Preparing email verification");
            const prepareResponse = await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            });
            if (!prepareResponse) {
                throw new Error("无法准备邮箱验证");
            }

            console.log("[handleEmailCheck] Email verification prepared successfully");
            toast({
                title: t("验证码已发送"),
                description: t("请查收邮件中的验证码")
            });

            return true;
        } catch (err: unknown) {
            console.error("[handleEmailCheck] Error:", err);
            setError(t((err as Error).message || "验证失败"));
            return false;
        } finally {
            setLoading(false);
            console.log("[handleEmailCheck] Process completed");
        }
    };

    const handleVerifyCode = async (code: string): Promise<boolean> => {
        console.log("[handleVerifyCode] Starting verification process");
        setLoading(true);
        setError(null);

        try {
            if (!signUp) {
                throw new Error("注册初始化失败");
            }

            console.log("[handleVerifyCode] Attempting email verification");
            const verifyResult = await signUp.attemptEmailAddressVerification({ code });
            if (verifyResult?.verifications.emailAddress?.status !== "verified") {
                throw new Error("邮箱验证失败");
            }

            console.log("[handleVerifyCode] Email verification successful");
            return true;
        } catch (err: unknown) {
            console.error("[handleVerifyCode] Error:", err);
            setError(t((err as Error).message || "验证失败"));
            return false;
        } finally {
            setLoading(false);
            console.log("[handleVerifyCode] Process completed");
        }
    };

    const handleUsernameCheck = async (): Promise<boolean> => {
        console.log("[handleUsernameCheck] Starting username check process");
        setLoading(true);
        setError(null);

        try {
            console.log("[handleUsernameCheck] Validating username format:", username);
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                throw new Error("用户名格式错误：仅支持字母、数字和下划线，长度3-20位");
            }

            if (!signUp) {
                throw new Error("注册初始化失败");
            }

            console.log("[handleUsernameCheck] Updating username");
            const updateResponse = await signUp.update({ username });
            if (!updateResponse) {
                throw new Error("用户名更新失败");
            }

            console.log("[handleUsernameCheck] Username updated successfully");
            return true;
        } catch (err: unknown) {
            console.error("[handleUsernameCheck] Error:", err);
            setError(t((err as Error).message || "该用户名已被使用"));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async (): Promise<boolean> => {
        console.log("[handleCompleteSignup] Starting signup completion process");
        setLoading(true);
        setError(null);

        try {
            if (!signUp) {
                throw new Error("注册初始化失败");
            }

            // 完成注册
            console.log("[handleCompleteSignup] Completing signup");
            const completeSignUp = await signUp.create({
                username,
                password
            });

            if (!completeSignUp) {
                toast({
                    title: t("注册失败"),
                    description: t("请稍后再试")
                });
                throw new Error("注册失败");
            }

            // 调用成功回调
            onSuccess();
            return true;
        } catch (err: unknown) {
            console.error("[handleCompleteSignup] Error:", err);
            setError(t((err as Error).message || "注册失败"));
            return false;
        } finally {
            setLoading(false);
            console.log("[handleCompleteSignup] Process completed");
        }
    };

    return {
        handleEmailCheck,
        handleUsernameCheck,
        handleVerifyCode,
        handleCompleteSignup,
        loading,
        error
    };
};

export default SignupHandler;
