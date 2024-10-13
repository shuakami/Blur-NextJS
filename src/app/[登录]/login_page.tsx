"use client";

import { Button } from "@/components/ui/button";
import {
    Activity, BookIcon,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Home,
    LanguagesIcon,
} from "lucide-react";
import Image from "next/image";
import {useRef, useState} from "react";
import LanguageDropdown from "@/app/[语言选择器]/language-dropdown";
import useTranslation from "@/hooks/useTranslation";
import { defaultLanguages } from "@/lib/languages";
import { motion } from "framer-motion";
import AuthGuard from "@/components/auth/AuthGuard";
import DropDownMenu from "@/components/ui/tofu/dropdown-menu";
import LoginMethodsWrapper from "@/app/[登录]/LoginMethodsWrapper";
import Meta from "@/components/ui/Meta";

export default function LoginPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { language, t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClose = () => {
        setMenuOpen(false);
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const getLanguageName = (code: string) => {
        const lang = defaultLanguages.find((lang) => lang.code === code);
        return lang ? lang.name : code;
    };

    const menuItems = [
        {
            id: 'docs',
            text: t('使用教程'),
            href: 'https://docs.blur-ai.tech',
            icon: BookIcon,
            target: '_blank'
        },
        {
            id: 'status',
            text: t('运行状态'),
            icon: Activity,
            href: 'https://status.blur-ai.tech',
            target: '_blank'
        },

        {
            id: 'home',
            text: t('回到首页'),
            href: '/',
            icon: Home,
            target: '_self',
            isSpecial: true
        },
    ];

    return (
        <AuthGuard>
            <Meta pageName={t('登录')}/>
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#fffefb] dark:bg-[#181818] text-[#040404] dark:text-[#f5f5f5] font-sans overflow-auto">
            {/* 左侧展示图片部分 */}
            <div className="hidden lg:block w-1/2 relative">
                <Image
                    src="/background.png"
                    alt="Showcase"
                    fill
                    style={{ objectFit: "cover" }}
                    quality={100}
                    className="dark:opacity-80"
                />
            </div>

            {/* 右侧登录表单部分 */}
            <div className="flex flex-col w-full lg:w-1/2 p-8 lg:p-16 justify-between">
                <header className="flex justify-end">
                    <DropDownMenu isOpen={menuOpen}
                                  onClose={handleClose}
                                  menuItems={menuItems} placement={'left'}
                                  referenceElement={buttonRef.current}
                    />
                    <Button
                        ref={buttonRef}
                        onClick={() => setMenuOpen(!menuOpen)}
                        variant="ghost"
                        size="icon"
                        className="text-[#c7c6c4]
                        dark:text-[#9e9e9e] dark:hover:text-[#c7c6c4] dark:hover:bg-transparent"
                    >
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </header>

                <main className="flex-grow flex flex-col justify-center max-w-[420px] mx-auto w-full lg:w-auto">
                    <h1 className="text-2xl font-semibold mb-2 leading-tight">
                        {t("春风拂柳绿，明月照花新。")}
                    </h1>
                    <p className="text-[#acaba9] dark:text-[#b3b3b3] text-xl mb-8 leading-tight">
                        {t("登录你的 Blur 帐号")}
                    </p>

                    <LoginMethodsWrapper/>

                    <div className="text-xs text-[#787874] dark:text-[#a1a1a1] text-center mt-2">
                        {t("你的姓名和照片会显示给通过你的邮件邀请你加入Blur的用户。继续操作即表示，你已确认理解并同意")}
                        <a href="#" className="text-[#acaba9] dark:text-[#b3b3b3] hover:underline ml-1">
                            {t("用户协议")}
                        </a>
                        {t(" 和")}
                        <a href="#" className="text-[#acaba9] dark:text-[#b3b3b3] hover:underline ml-1">
                            {t("隐私政策")}
                        </a>
                        。
                    </div>
                </main>

                <footer className="mt-12 flex justify-end translate-x-3 relative">
                    <div className="mr-20 -mt-5">
                        {isDropdownOpen && (
                            <LanguageDropdown
                                direction="up"
                                setIsOpen={setIsDropdownOpen}
                            />
                        )}
                    </div>
                    <button
                        className="text-[#91918e] dark:text-[#b3b3b3] text-sm flex items-center relative z-10"
                        onClick={toggleDropdown}
                    >
                        <LanguagesIcon className="w-3.5 h-3.5 mr-1 text-[#acaba9] dark:text-[#b3b3b3]" />
                        {getLanguageName(language)}
                        <motion.div
                            className="flex items-center"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isDropdownOpen ? (
                                <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                                <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                        </motion.div>
                    </button>
                </footer>
            </div>
        </div>
        </AuthGuard>
    );
}
