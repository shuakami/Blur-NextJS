"use client";

import {
    Activity, BookIcon,
    ChevronDown,
    HelpCircle,
    Home,
    LanguagesIcon,
} from "lucide-react";
import Image from "next/image";
import {useRef, useState} from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import LanguageDropdown from "@/app/[语言选择器]/language-dropdown";
import LoginMethodsWrapper from "@/app/[登录]/LoginMethodsWrapper";
import Meta from "@/components/ui/Meta";
import useTranslation from "@/hooks/useTranslation";
import { defaultLanguages } from "@/lib/languages";
import { MenuItems, MenuItem } from "@/components/ui/dropdown-menu";

export default function LoginPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { language, t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const helpButtonRef = useRef<HTMLButtonElement>(null);
    const langButtonRef = useRef<HTMLButtonElement>(null);
    
    const getLanguageName = (code: string) => {
        const lang = defaultLanguages.find((lang) => lang.code === code);
        return lang ? lang.name : code;
    };

    const helpMenuItems = [
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
            <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-50 dark:bg-neutral-900">
                {/* 左侧展示图片 */}
                <div className="hidden lg:block lg:w-1/2 relative">
                    <Image
                        src="/background.png"
                        alt="Showcase"
                        fill
                        priority
                        className="object-cover dark:opacity-85 transition-opacity"
                    />
                </div>

                {/* 右侧登录区域 */}
                <div className="flex flex-col w-full lg:w-1/2 p-6 lg:p-12 xl:p-16">
                    {/* 头部帮助按钮 */}
                    <header className="flex justify-end mb-8">
                        <div className="relative">
                            <button
                                ref={helpButtonRef}
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 
                                         dark:text-neutral-500 dark:hover:text-neutral-300 
                                         hover:bg-neutral-100 dark:hover:bg-neutral-800
                                         transition-colors"
                            >
                                <HelpCircle className="h-5 w-5" />
                            </button>
                            <MenuItems
                                isOpen={menuOpen}
                                onClose={() => setMenuOpen(false)}
                                referenceElement={helpButtonRef.current}
                                className="w-[240px]"
                                mobileHeader={{
                                    title: t('帮助')
                                }}
                            >
                                {helpMenuItems.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        icon={item.icon}
                                        onClick={() => {
                                            window.open(item.href, item.target);
                                            setMenuOpen(false);
                                        }}
                                    >
                                        {item.text}
                                    </MenuItem>
                                ))}
                            </MenuItems>
                        </div>
                    </header>

                    {/* 主要登录区域 */}
                    <main className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {t("春风拂柳绿，明月照花新。")}
                            </h1>
                            <p className="text-base text-neutral-500 dark:text-neutral-400">
                                {t("登录你的 Blur 帐号")}
                            </p>
                        </div>

                        <LoginMethodsWrapper />

                        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
                            {t("你的姓名和照片会显示给通过你的邮件邀请你加入Blur的用户。继续操作即表示，你已确认理解并同意")}
                            <a href="#" className="text-neutral-700 dark:text-neutral-300 hover:underline">
                                {t("用户协议")}
                            </a>
                            {t(" 和")}
                            <a href="#" className="text-neutral-700 dark:text-neutral-300 hover:underline">
                                {t("隐私政策")}
                            </a>
                            。
                        </div>
                    </main>

                    {/* 底部语言选择器 */}
                    <footer className="mt-auto pt-8">
                        <div className="flex justify-end items-center">
                            <button
                                ref={langButtonRef}
                                className="flex items-center space-x-2 text-sm text-neutral-500 
                                         dark:text-neutral-400 hover:text-neutral-700 
                                         dark:hover:text-neutral-200 transition-colors"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <LanguagesIcon className="w-4 h-4" />
                                <span>{getLanguageName(language)}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            <LanguageDropdown
                                isOpen={isDropdownOpen}
                                onClose={() => setIsDropdownOpen(false)}
                                referenceElement={langButtonRef.current}
                            />
                        </div>
                    </footer>
                </div>
            </div>
        </AuthGuard>
    );
}
