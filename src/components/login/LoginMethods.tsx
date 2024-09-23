// components/login/LoginMethods.tsx
"use client";

import {useEffect, useState} from "react";
import GitHubLoginButton from "./GitHubLoginButton";
import GoogleLoginButton from "./GoogleLoginButton";
import BetaUserLoginButton from "./BetaUserLoginButton";
import EmailLoginForm from "./EmailLoginForm";
import BetaLoginForm from "./BetaLoginForm";
import { motion, AnimatePresence } from "framer-motion";
import useTranslation from "@/hooks/useTranslation";
import {toast} from "@/hooks/use-toast";

export default function LoginMethods() {
    const { t } = useTranslation();
    const [isEmailLogin, setIsEmailLogin] = useState(true);

    const toggleLoginMethod = () => {
        setIsEmailLogin((prev) => !prev);
    };

    const handleEmailLogin = (email: string, password: string) => {
        console.log("邮箱登录:", email, password);
    };

    const handleBetaLogin = (email: string, password: string) => {
        console.log("内测用户登录:", email, password);
    };

    return (
        <div className="w-full">
            <GitHubLoginButton/>
            <GoogleLoginButton/>

            <BetaUserLoginButton isEmailLogin={isEmailLogin} toggleLoginMethod={toggleLoginMethod}/>

            <hr className="border-t border-[#acaba9]/15 dark:border-[#666666]/40 mb-5"/>

            <AnimatePresence mode="wait">
                {isEmailLogin ? (
                    <motion.div
                        key="email-login"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <EmailLoginForm onSubmit={handleEmailLogin}/>
                    </motion.div>
                ) : (
                    <motion.div
                        key="beta-login"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <BetaLoginForm onBack={toggleLoginMethod}/>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}