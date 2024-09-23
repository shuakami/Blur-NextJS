// components/login/GoogleLoginButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import useTranslation from "@/hooks/useTranslation";

export default function GoogleLoginButton() {
    const { t } = useTranslation();

    const handleGoogleLogin = () => {
        // Google OAuth 登录逻辑（跳转/api/auth/google）
        window.open("/api/auth/google", "googleAuthWindow", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=1300, height=700');
    };

    return (
        <Button
            variant="outline"
            className="w-full mb-3 justify-center text-sm font-normal h-10 bg-transparent dark:bg-[#333333]/45 dark:border-[#666666]/50"
            onClick={handleGoogleLogin}
        >
            <svg viewBox="0 0 18 18" className="w-4 h-4 mr-2">
                <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                    fill="#FBBC05"
                    d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
            </svg>
            {t("Google 登录")}
        </Button>
    );
}
