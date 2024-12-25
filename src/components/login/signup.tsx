"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTranslation from '../../hooks/i18n/useTranslation';
import { useToast } from '../../hooks/ui/use-toast';
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { cn } from '../../lib/utils/utils';
import SignupHandler from "./[安全工具]/SignupHandler";
import AgreementModal from "./agreement-modal";
import { useRouter } from "next/navigation";

// 主组件
interface RegisterFormProps {
    onBack: () => void;
}

export default function RegisterForm({ onBack }: RegisterFormProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState<"email" | "verify" | "username" | "password">("email");
    const [emailSubStage, setEmailSubStage] = useState<"email" | "invite">("email");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [showAgreement, setShowAgreement] = useState(false);
    const router = useRouter();


    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        inviteCode: "",
        verificationCode: ""
    });

    // 密码规则
    const passwordRules = [
        {
            id: "length",
            label: t("至少8个字符"),
            check: (pass: string) => pass.length >= 8
        },
        {
            id: "alphanumeric",
            label: t("包含字母和数字"),
            check: (pass: string) => /[a-zA-Z]/.test(pass) && /\d/.test(pass)
        }
    ];

    // 表单处理
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    // 注册处理器
    const signupHandler = SignupHandler({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        inviteCode: formData.inviteCode,
        onSuccess: () => {
            toast({
                title: t("注册成功"),
                description: t("正在跳转...")
            });
            // 跳 /
            window.location.href = "/";
        }
    });

    // 表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let success = false;

            switch (stage) {
                case "email":
                    success = await signupHandler.handleEmailCheck();
                    if (success) setStage("verify");
                    break;
                case "verify":
                    success = await signupHandler.handleVerifyCode(formData.verificationCode);
                    if (success) setStage("username");
                    break;
                case "username":
                    success = await signupHandler.handleUsernameCheck();
                    if (success) setStage("password");
                    break;
                case "password":
                    if (formData.password !== formData.confirmPassword) {
                        throw new Error(t("两次密码不一致"));
                    }
                    setShowAgreement(true);
                    break;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="w-full">
                {/* GitHub注册按钮 */}
                <Button
                    variant="outline" 
                    className="w-full mb-3 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333]/45 dark:border-[#666666]/50"
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                        <path
                            fill="currentColor"
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                    </svg>
                    Github {t("注册")}
                </Button>

                {/* Google注册按钮 */}
                <Button
                    variant="outline"
                    className="w-full mb-6 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333]/45 dark:border-[#666666]/50"
                >
                    <svg viewBox="0 0 18 18" className="w-4 h-4 mr-2">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    Google {t("注册")}
                </Button>

                {/* 分隔线 */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-500 dark:text-neutral-400">
                            {t("或使用邮箱注册")}
                        </span>
                    </div>
                </div>

                {/* 多步骤注册表单 */}
                <AnimatePresence mode="wait">
                {stage === "email" && (
    <>
        {emailSubStage === "email" && (
            <motion.form
                key="email-input"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={(e) => {
                    e.preventDefault();
                    setEmailSubStage("invite");
                }}
            >
                <div className="space-y-4">
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("邮箱")}
                        required
                    />
                    <Button
                        type="submit"
                        className="w-full bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90"
                        disabled={!formData.email}
                    >
                        {t("下一步")}
                    </Button>
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            className="text-sm text-[#2383e2] dark:text-[#1a73e8] hover:bg-transparent hover:text-[#2383e2]/90 dark:hover:text-[#1a73e8]/90"
                            onClick={onBack}
                        >
                            {t("已有账号？立即登录")}
                        </Button>
                    </div>
                </div>
                </motion.form>
            )}

        {emailSubStage === "invite" && (
            <motion.form
                key="invite-input"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            name="inviteCode"
                            value={formData.inviteCode}
                            onChange={handleChange}
                            placeholder={t("邀请码")}
                            required
                        />
                        <p className="text-[#acaba9] dark:text-[#8c8c8c] text-xs">
                            {t("目前仅对内测用户开放注册。如果你没有邀请码，可以")}
                            <a 
                                href="https://docs.blur-ai.tech/waitlist" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500/80 hover:text-blue-600/80 transition-colors"
                            >
                                {t("申请加入内测")}
                            </a>
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setEmailSubStage("email")}
                        >
                            {t("上一步")}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90"
                            disabled={loading}
                        >
                            {loading ? t("发送中...") : t("发送验证码")}
                        </Button>
                    </div>
                </div>
            </motion.form>
        )}
    </>
)}

{stage === "verify" && (
    <motion.form
        key="verify"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
    >
        <div className="space-y-4">
            <div className="text-center mb-4">
                <p className="text-sm text-[#acaba9] dark:text-[#8c8c8c]">
                    {t("我们已向")} <span className="text-neutral-900 dark:text-neutral-100">{formData.email}</span>{" "}
                    {t("发送了验证码")}
                </p>
            </div>
            
            <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                        title={t("请输入验证码")}
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg border rounded-lg 
                                 focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] 
                                 dark:bg-[#333333]/45 dark:border-[#444444]
                                 transition-all duration-200"
                        value={formData.verificationCode[index] || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            const newCode = formData.verificationCode.split('');
                            newCode[index] = value;
                            
                            handleChange({
                                target: {
                                    name: 'verificationCode',
                                    value: newCode.join('')
                                }
                            } as React.ChangeEvent<HTMLInputElement>);
                            
                            // 如果输入了有效字符，自动跳转到下一个输入框
                            if (value && index < 5) {
                                inputRefs.current[index + 1]?.focus();
                            }
                        }}
                        onKeyDown={(e) => {
                            // 处理退格键
                            if (e.key === 'Backspace' && !formData.verificationCode[index] && index > 0) {
                                inputRefs.current[index - 1]?.focus();
                            }
                            // 处理左右箭头键
                            if (e.key === 'ArrowLeft' && index > 0) {
                                inputRefs.current[index - 1]?.focus();
                            }
                            if (e.key === 'ArrowRight' && index < 5) {
                                inputRefs.current[index + 1]?.focus();
                            }
                        }}
                        onPaste={(e) => {
                            e.preventDefault();
                            const pastedData = e.clipboardData.getData('text').slice(0, 6);
                            handleChange({
                                target: {
                                    name: 'verificationCode',
                                    value: pastedData
                                }
                            } as React.ChangeEvent<HTMLInputElement>);
                            // 如果粘贴了完整的验证码，聚焦到最后一个输入框
                            if (pastedData.length === 6) {
                                inputRefs.current[5]?.focus();
                            }
                        }}
                    />
                ))}
            </div>

            <Button
                type="submit"
                className="w-full bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90"
                disabled={loading || formData.verificationCode.length !== 6}
            >
                {loading ? t("验证中...") : t("验证")}
            </Button>
        </div>
    </motion.form>
)}
                    {stage === "username" && (
                        <motion.form
                            key="username"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder={t("用户名")}
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90"
                                    disabled={loading}
                                >
                                    {loading ? t("检查中...") : t("下一步")}
                                </Button>
                            </div>
                        </motion.form>
                    )}

                    {stage === "password" && (
                        <motion.form
                            key="password"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder={t("密码")}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={t("确认密码")}
                                        required
                                    />
                                </div>

                                {/* 密码规则检查 */}
                                <div className="space-y-2">
                                    {passwordRules.map(rule => (
                                        <div
                                            key={rule.id}
                                            className="flex items-center space-x-2 text-sm"
                                        >
                                            {rule.check(formData.password) ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <X className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className={cn(
                                                "text-gray-600 dark:text-gray-400",
                                                rule.check(formData.password) && "text-green-600 dark:text-green-400"
                                            )}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#2383e2] hover:bg-[#2383e2]/90 dark:bg-[#1a73e8] dark:hover:bg-[#1a73e8]/90"
                                    disabled={loading}
                                >
                                    {loading ? t("注册中...") : t("完成注册")}
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="mt-4 text-sm text-red-500 text-center">
                        {error}
                    </div>
                )}
            </div>
            <AgreementModal
                isOpen={showAgreement}
                onClose={() => setShowAgreement(false)}
                onAgree={async () => {
                    setLoading(true);
                    try {
                        const success = await signupHandler.handleCompleteSignup();
                        if (success) {
                            router.push("/" as any);
                        }
                    } catch (err: any) {
                        setError(err.message);
                    } finally {
                        setLoading(false);
                    }
                }}
                loading={loading}
            />
        </div>
    );
}

function reloadUser() {
    throw new Error("Function not implemented.");
}
