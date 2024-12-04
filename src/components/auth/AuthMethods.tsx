"use client";

import { useState } from "react";
import RegisterForm from "../login/signup";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../login/Login";
import useTranslation from '../../hooks/i18n/useTranslation';

export default function AuthMethods({ mode }: { mode: string }) {
    const [isRegister, setIsRegister] = useState(mode === "register");
    const { t } = useTranslation();

    const titles = {
        login: {
            poem: t("春风拂柳绿，明月照花新。"),
            subtitle: t("登录你的 Blur 帐号")
        },
        register: {
            poem: t("云想衣裳花想容，春风拂槛露华浓。"),
            subtitle: t("创建你的 Blur 帐号")
        }
    };

    return (
        <div className="w-full space-y-8">
            {/* 标题区域 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={isRegister ? "register-title" : "login-title"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                >
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {isRegister ? titles.register.poem : titles.login.poem}
                    </h1>
                    <p className="text-base text-neutral-500 dark:text-neutral-400">
                        {isRegister ? titles.register.subtitle : titles.login.subtitle}
                    </p>
                </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {isRegister ? (
                    <motion.div
                        key="register"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        <RegisterForm onBack={() => setIsRegister(false)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        <Login callback={() => setIsRegister(true)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}